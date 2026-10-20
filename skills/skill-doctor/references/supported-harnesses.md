# Supported session sources

This file is the single source of truth for session support in `skill-doctor`. Reference it instead of repeating source lists in `SKILL.md`.

The executing harness does not need to be supported here. `skill-doctor` reads whatever conversation history exists on disk, even when that history came from a different agent than the one running the skill.

## Sources

| Source | Collector ID | Local conversation source |
| --- | --- | --- |
| Cake | `cake` | Session JSONL (`$CAKE_DATA_DIR/sessions`, `$XDG_DATA_HOME/cake/sessions`, `~/.local/share/cake/sessions`) |
| Claude Code | `claude` | Project-history JSONL |
| Codex | `codex` | Rollout JSONL |
| Warp | `warp` | Read-only Warp conversation databases |
| Pi | `pi` | Pi agent JSONL (`~/.pi/agent/sessions`) |
| Grok Build | `grok` | Grok Build chat_history JSONL (`~/.grok/sessions`) |
| ZCode | `zcode` | ZCode model-io rollout (`~/.zcode/cli/rollout`) |
| Hermes | `hermes` | Hermes Agent state.db (SQLite: `sessions` + `messages`) |

If no supported source is found on this machine, tell the user:

> skill-doctor found no supported local conversation history. It currently reads Cake, Claude Code, Codex, Warp, Pi, Grok Build, ZCode, and Hermes sessions.

## Source selection

- `--harness auto` scans every locally available supported source and is the default.
- `--harness all` also requests every supported source.
- `--harness <collector-id>` restricts collection to one source from the table.
- A report containing one source uses its collector ID in `inventory.json`; a report containing multiple sources uses `mixed`.

Source-specific location overrides:

- `--cake-home PATH` — nonstandard Cake data directory containing `sessions/`.
- `--claude-home PATH` — nonstandard Claude Code configuration directory.
- `--codex-home PATH` — nonstandard Codex home.
- `--warp-db PATH` — explicit Warp database; repeatable.
- `--warp-data-dir PATH` — nonstandard Warp channel-data directory.
- `--pi-home PATH` — nonstandard Pi agent home (default `~/.pi/agent`).
- `--grok-home PATH` — nonstandard Grok Build home (default `~/.grok`).
- `--zcode-home PATH` — nonstandard ZCode home (default `~/.zcode`).
- `--hermes-home PATH` — Hermes Agent home containing `state.db` (default discovery checks `HERMES_HOME`, `~/.hermes`, then `~`).

Cake stores subagent runs outside its session log, so `--include-subagents` has no effect on that source.

## Skill locations

Project skills are discovered from these directories relative to each repository:

- `.agents/skills`
- `.claude/skills`
- `.codex/skills`
- `.cursor/skills`
- `.github/skills`
- `skills` (skill-collection layout: `skills/<name>/SKILL.md`)

Global skills are discovered from the corresponding directories under the user's home when `--include-global-skills` is set: `~/.agents/skills`, `~/.claude/skills`, `~/.codex/skills`, `~/.cursor/skills`, `~/.copilot/skills`, plus each configured harness home's `skills/` directory (Pi, Grok Build, ZCode, Hermes).

## Adding another source

1. Add a `find_*_session_files` function that returns recent `(mtime, path)` pairs.
2. Add a `parse_*_session` function that returns `(meta, stats, entries, skills_used)` using `TranscriptBuffer` and the shared truncation limits. Increment `tool_calls`, `repeated_tool_calls`, `error_outputs`, and `has_code_edits` the same way the existing parsers do.
3. Register the source in `main()`, add its `--harness` choice and home override, and add it to the `sources`/`inventory.json` output.
4. Add a parser test beside the existing collector tests, then update the table above.
