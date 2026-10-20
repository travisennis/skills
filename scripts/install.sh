#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

expand_user_path() {
  local input="$1"

  if [ "$input" = "~" ]; then
    printf '%s\n' "$HOME"
  elif [[ "$input" == "~/"* ]]; then
    printf '%s/%s\n' "$HOME" "${input#~/}"
  else
    printf '%s\n' "$input"
  fi
}

die() {
  echo "Error: $*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage: install.sh [options]

Install skills from this repository.

Options:
  --all                Install every skill under skills/
  --skills <list>      Comma-separated skill names
  --dest <target>      project, global, cursor-project, cursor-global,
                       claude-project, claude-global, copilot-project,
                       copilot-global, or a filesystem path
  --force              Replace existing skill directories
  --dry-run            Show what would be copied without copying
  --list               List installable skills and exit
  -h, --help           Show this help

With no --all or --skills, the script prompts for a selection. With no --dest,
it prompts unless --all or --skills was given, in which case it defaults to
the current project's .agents/skills directory.
EOF
}

list_skills() {
  local skill_file
  while IFS= read -r skill_file; do
    basename "$(dirname "$skill_file")"
  done < <(find "$REPO_DIR/skills" -mindepth 2 -maxdepth 2 -name "SKILL.md" -print | sort)
}

skills=()
while IFS= read -r skill; do
  skills+=("$skill")
done < <(list_skills)

if [ ${#skills[@]} -eq 0 ]; then
  echo "No skills found in $REPO_DIR/skills"
  exit 1
fi

select_all=0
skill_list=""
dest_arg=""
force=0
dry_run=0
list_only=0
interactive=1

while [ $# -gt 0 ]; do
  case "$1" in
    --all)
      select_all=1
      interactive=0
      shift
      ;;
    --skills)
      [ $# -ge 2 ] || die "--skills requires a comma-separated list"
      skill_list="$2"
      interactive=0
      shift 2
      ;;
    --dest)
      [ $# -ge 2 ] || die "--dest requires a target"
      dest_arg="$2"
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --list)
      list_only=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1 (try --help)"
      ;;
  esac
done

if [ "$list_only" -eq 1 ]; then
  printf '%s\n' "${skills[@]}"
  exit 0
fi

echo "Available skills:"
for i in "${!skills[@]}"; do
  echo "  $((i + 1)). ${skills[$i]}"
done
echo ""

selected=()
if [ "$select_all" -eq 1 ]; then
  selected=("${skills[@]}")
elif [ -n "$skill_list" ]; then
  IFS=',' read -ra names <<< "$skill_list"
  for name in "${names[@]}"; do
    name="$(echo "$name" | tr -d ' ')"
    [ -n "$name" ] || continue
    found=0
    for skill in "${skills[@]}"; do
      if [ "$name" = "$skill" ]; then
        found=1
        break
      fi
    done
    if [ "$found" -eq 1 ]; then
      selected+=("$name")
    else
      die "unknown skill: $name"
    fi
  done
else
  read -rp "Which skills to install? (comma-separated numbers or 'all') [all]: " selection
  selection="${selection:-all}"

  if [ "$selection" = "all" ]; then
    selected=("${skills[@]}")
  else
    IFS=',' read -ra indices <<< "$selection"
    for idx in "${indices[@]}"; do
      idx="$(echo "$idx" | tr -d ' ')"
      if [[ "$idx" =~ ^[0-9]+$ ]] && [ "$idx" -ge 1 ] && [ "$idx" -le ${#skills[@]} ]; then
        selected+=("${skills[$((idx - 1))]}")
      else
        echo "Warning: Ignoring invalid selection '$idx'"
      fi
    done
  fi
fi

if [ ${#selected[@]} -eq 0 ]; then
  echo "No valid skills selected. Exiting."
  exit 1
fi

resolve_dest() {
  local choice="$1"
  local lower
  lower="$(echo "$choice" | tr '[:upper:]' '[:lower:]')"

  case "$lower" in
    project|1) printf '%s\n' "./.agents/skills" ;;
    global|2) printf '%s\n' "$HOME/.agents/skills" ;;
    cursor-project|3) printf '%s\n' "./.cursor/skills" ;;
    cursor-global|4) printf '%s\n' "$HOME/.cursor/skills" ;;
    claude-project|5) printf '%s\n' "./.claude/skills" ;;
    claude-global|6) printf '%s\n' "$HOME/.claude/skills" ;;
    copilot-project|7) printf '%s\n' "./.github/skills" ;;
    copilot-global|8) printf '%s\n' "$HOME/.copilot/skills" ;;
    *) expand_user_path "$choice" ;;
  esac
}

if [ -n "$dest_arg" ]; then
  DEST="$(resolve_dest "$dest_arg")"
  dest_label="$DEST"
else
  echo "Install destination:"
  echo "  1. Project (.agents standard)  (./.agents/skills)"
  echo "  2. Global  (.agents standard)  (~/.agents/skills)"
  echo "  3. Cursor project             (./.cursor/skills)"
  echo "  4. Cursor global              (~/.cursor/skills)"
  echo "  5. Claude project             (./.claude/skills)"
  echo "  6. Claude global              (~/.claude/skills)"
  echo "  7. Copilot project            (./.github/skills)"
  echo "  8. Copilot global             (~/.copilot/skills)"
  echo "  9. Custom path"
  read -rp "Choose destination [1]: " dest_choice
  dest_choice="${dest_choice:-1}"
  dest_choice="${dest_choice//[[:space:]]/}"

  if [ "$dest_choice" = "9" ]; then
    while :; do
      read -rp "Enter custom destination path: " custom_dest
      custom_dest="${custom_dest#"${custom_dest%%[![:space:]]*}"}"
      custom_dest="${custom_dest%"${custom_dest##*[![:space:]]}"}"

      if [ -n "$custom_dest" ]; then
        DEST="$(expand_user_path "$custom_dest")"
        break
      fi

      echo "Custom destination cannot be empty."
    done
    dest_label="$DEST"
  else
    DEST="$(resolve_dest "$dest_choice")"
    dest_label="$DEST"
  fi
fi

copy_skill() {
  local source="$1"
  local destination="$2"

  mkdir -p "$destination"
  tar -C "$source" \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='.DS_Store' \
    -cf - . | tar -C "$destination" -xf -
}

if [ "$dry_run" -eq 1 ]; then
  echo "Dry run: no files will be copied."
else
  mkdir -p "$DEST"
fi

installed=()
skipped=()
replaced=()

for skill in "${selected[@]}"; do
  source="$REPO_DIR/skills/$skill"
  target="$DEST/$skill"

  if [ ! -f "$source/SKILL.md" ]; then
    die "skill not found: $skill"
  fi

  if [ -d "$target" ]; then
    if [ "$force" -eq 1 ]; then
      if [ "$dry_run" -eq 1 ]; then
        echo "Would replace: $skill"
      else
        rm -rf "${DEST:?}/$skill"
        copy_skill "$source" "$target"
      fi
      replaced+=("$skill")
    elif [ "$interactive" -eq 1 ]; then
      read -rp "'$skill' already exists at destination. [S]kip or [R]eplace? [S]: " conflict_choice
      conflict_choice="${conflict_choice:-S}"
      conflict_choice="$(echo "$conflict_choice" | tr '[:lower:]' '[:upper:]')"
      case "$conflict_choice" in
        R)
          if [ "$dry_run" -eq 1 ]; then
            echo "Would replace: $skill"
          else
            rm -rf "${DEST:?}/$skill"
            copy_skill "$source" "$target"
          fi
          replaced+=("$skill")
          ;;
        *)
          skipped+=("$skill")
          ;;
      esac
    else
      echo "Skipping existing skill (use --force to replace): $skill"
      skipped+=("$skill")
    fi
  else
    if [ "$dry_run" -eq 1 ]; then
      echo "Would install: $skill"
    else
      copy_skill "$source" "$target"
    fi
    installed+=("$skill")
  fi
done

echo ""
echo "========== Installation Summary =========="
echo "Destination: $dest_label"

if [ ${#installed[@]} -gt 0 ]; then
  echo "Installed (new):"
  for s in "${installed[@]}"; do echo "  - $s"; done
fi

if [ ${#replaced[@]} -gt 0 ]; then
  echo "Installed (replaced):"
  for s in "${replaced[@]}"; do echo "  - $s"; done
fi

if [ ${#skipped[@]} -gt 0 ]; then
  echo "Skipped:"
  for s in "${skipped[@]}"; do echo "  - $s"; done
fi

total=$(( ${#installed[@]} + ${#replaced[@]} ))
echo ""
echo "Total installed: $total | Skipped: ${#skipped[@]}"
echo "=========================================="
