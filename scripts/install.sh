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

skills=()
while IFS= read -r skill_file; do
  skills+=("$(basename "$(dirname "$skill_file")")")
done < <(find "$REPO_DIR" -maxdepth 3 -name "SKILL.md" -not -path "*/.git/*" -not -path "*/scripts/*" | sort)

if [ ${#skills[@]} -eq 0 ]; then
  echo "No skills found in $REPO_DIR"
  exit 1
fi

echo "Available skills:"
for i in "${!skills[@]}"; do
  echo "  $((i + 1)). ${skills[$i]}"
done
echo ""
read -rp "Which skills to install? (comma-separated numbers or 'all') [all]: " selection
selection="${selection:-all}"

selected=()
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

if [ ${#selected[@]} -eq 0 ]; then
  echo "No valid skills selected. Exiting."
  exit 1
fi

echo ""
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

case "$dest_choice" in
  2)
    DEST="$HOME/.agents/skills"
    dest_label="global (~/.agents/skills)"
    ;;
  3)
    DEST="./.cursor/skills"
    dest_label="cursor project (./.cursor/skills)"
    ;;
  4)
    DEST="$HOME/.cursor/skills"
    dest_label="cursor global (~/.cursor/skills)"
    ;;
  5)
    DEST="./.claude/skills"
    dest_label="claude project (./.claude/skills)"
    ;;
  6)
    DEST="$HOME/.claude/skills"
    dest_label="claude global (~/.claude/skills)"
    ;;
  7)
    DEST="./.github/skills"
    dest_label="copilot project (./.github/skills)"
    ;;
  8)
    DEST="$HOME/.copilot/skills"
    dest_label="copilot global (~/.copilot/skills)"
    ;;
  9)
    while :; do
      read -rp "Enter custom destination path: " custom_dest
      custom_dest="${custom_dest#"${custom_dest%%[![:space:]]*}"}"
      custom_dest="${custom_dest%"${custom_dest##*[![:space:]]}"}"

      if [ -n "$custom_dest" ]; then
        DEST="$(expand_user_path "$custom_dest")"
        dest_label="custom ($DEST)"
        break
      fi

      echo "Custom destination cannot be empty."
    done
    ;;
  1)
    DEST="./.agents/skills"
    dest_label="project (./.agents/skills)"
    ;;
  *)
    echo "Warning: Unknown destination '$dest_choice', defaulting to project (./.agents/skills)"
    DEST="./.agents/skills"
    dest_label="project (./.agents/skills)"
    ;;
esac

mkdir -p "$DEST"

installed=()
skipped=()
replaced=()

for skill in "${selected[@]}"; do
  if [ -d "$DEST/$skill" ]; then
    read -rp "'$skill' already exists at destination. [S]kip or [R]eplace? [S]: " conflict_choice
    conflict_choice="${conflict_choice:-S}"
    case "${conflict_choice^^}" in
      R)
        rm -rf "${DEST:?}/$skill"
        cp -r "$REPO_DIR/$skill" "$DEST/$skill"
        replaced+=("$skill")
        ;;
      *)
        skipped+=("$skill")
        ;;
    esac
  else
    cp -r "$REPO_DIR/$skill" "$DEST/$skill"
    installed+=("$skill")
  fi
done

echo ""
echo "========== Installation Summary =========="
echo "Destination: $dest_label"
echo ""

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
