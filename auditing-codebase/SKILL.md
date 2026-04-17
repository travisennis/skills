---
name: auditing-codebase
description: >
  Investigate, audit, and surface information about a git repository using diagnostic commands.
  Use when you need to: understand codebase health, hotspots, and pain points before reading code; identify high-churn files, bug clusters, and technical debt; analyze contributor patterns, bus factor, and team dynamics; assess project velocity, momentum, and maintenance status; surface information for due diligence, onboarding, or audits.
  Commands include file churn analysis, bug density mapping, commit velocity charts, contributor attribution, and firefighting detection.
---

# Auditing Codebase

Use git commands to diagnose a repository before reading its code.

## Quick Audit (5 Commands)

```bash
# 1. Most-changed files (high churn = high risk)
git log --format=format: --name-only --since="1 year ago" | sort | uniq -c | sort -nr | head -20

# 2. Contributors ranked by commit count
git shortlog -sn --no-merges

# 3. Bug hotspots (files in fix/bug/broken commits)
git log -i -E --grep="fix|bug|broken" --name-only --format='' | sort | uniq -c | sort -nr | head -20

# 4. Commit velocity by month (look for declining curve or sudden drops)
git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c

# 5. Firefighting frequency (reverts, hotfixes, emergency patches)
git log --oneline --since="1 year ago" | grep -iE 'revert|hotfix|emergency|rollback'
```

## Deep Audit Commands

### Summary (full repo overview)
```bash
# Branch name
git rev-parse --abbrev-ref HEAD

# Commit count
git rev-list --count HEAD

# Author count
git log --format=oneline --format="%aE" | awk '{a[$0]=1}END{for(i in a){n++;} print n}'

# Date count (unique days with commits)
git log --format=oneline --format="%ad" --date=format:"%Y-%m-%d" | awk '{a[$0]=1}END{for(i in a){n++;} print n}'

# Tag count
git tag | wc -l

# Local and remote branches
git branch | grep -v " -> " | wc -l
git branch -r | grep -v " -> " | wc -l

# Tracked files
git ls-files | wc -l

# First and latest commits
git log --date-order --format=%cI | tail -1   # first
git log -1 --date-order --format=%cI          # latest
```

### Churn (files with most changes)
```bash
# All-time churn
git log --all --find-copies --find-renames --name-only --format='format:' | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn | head -30

# Churn with time filter
git log --all --find-copies --find-renames --name-only --format='format:' --since="1 month ago" | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn | head -20

# Churn for specific directories
git log --all --find-copies --find-renames --name-only --format='format:' -- app/ lib/ | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn | head -20
```

### WhoRank (contributors by commit count)
```bash
# All-time contributors
git shortlog --summary --numbered --no-merges

# Recent contributors (compare with all-time)
git shortlog --summary --numbered --no-merges --since="6 months ago"

# Contributors with percentages
git log --format=oneline --format="%aE" | awk '{a[$0]++}END{for(i in a){print a[i], int((a[i]/NR)*100) "%", i}}' | sort -rn
```

### Chart (activity per author)
```bash
# Default: 6-week activity chart per author
git log \
  --format=oneline \
  --format="%aE %at" \
  --since=6-weeks-ago | \
awk '
function time_to_slot(t) { return strftime("%Y-%m-%d", t, true) }
function count_to_char(i) { return (i > 0) ? ((i < 10) ? i : "X") : "." }
BEGIN { time_min = systime(); time_max = 0; SECONDS_PER_DAY=86400; }
{
  item = $1; time = 0 + $2;
  if (time > time_max){ time_max = time } else if (time < time_min){ time_min = time };
  slot = time_to_slot(time); items[item]++; slots[slot]++; views[item, slot]++;
}
END{
  printf("Chart time range %s to %s.\n", time_to_slot(time_min), time_to_slot(time_max));
  time_max_add = time_max += SECONDS_PER_DAY;
  for(item in items){
    row = "";
    for(time = time_min; time < time_max_add; time += SECONDS_PER_DAY) {
      slot = time_to_slot(time); count = views[item, slot]; row = row count_to_char(count);
    }
    print row, item;
  }
}'
```

### Commits by Time Period
```bash
# By day
git log --format=oneline --format="%ad" --date=format:"%Y-%m-%d" | awk '{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn | head -30

# By week
git log --format=oneline --format="%ad" --date=format:"%Y#%V" | awk '{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn | head -20

# By month
git log --format=oneline --format="%ad" --date=format:"%Y-%m" | awk '{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn

# By hour of day
git log --format=oneline --format="%ad" --date=format:"%H" | awk '{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn

# By day of week
git log --format=oneline --format="%ad" --date=format:"%u" | awk '{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn
```

### Lost and Orphans
```bash
# Dangling commits
git fsck | awk '/dangling commit/ {print $3}' | git show --format='SHA1: %h %f' --annotate-stdin | grep SHA1

# Orphan commits (unreachable)
git fsck --full | awk '/dangling commit/ {print $3}' | while read hash; do git log -1 --format="%h %s" $hash 2>/dev/null && echo $hash; done
```

### Search Commits
```bash
# Find commits adding/removing a string
git log -S"search_string" --oneline

# With context
git log -S"search_string" --pickaxe-all -U1

# In specific directory
git log -S"search_string" --oneline -- <directory>

# Search all branches
git log --all -S"search_string" --oneline
```

### Branch Analysis
```bash
# Branches by recent activity
git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/heads/

# Merged branches (safe to delete)
git branch --merged

# Unmerged branches
git branch --no-merged

# Remote tracking branches
git branch -r
```

### File-Level Analysis
```bash
# Who changed a file
git log --format='%an' -- <file> | sort | uniq -c | sort -rn

# When a file was last touched
git log -1 --format='%ad %an' -- <file>

# Contributors to files in a directory
git log --format='%an' -- <directory> | sort | uniq -c | sort -rn
```

## Interpretation Guide

### High-Risk File Signals
- Files appearing on both churn and bug lists: highest risk
- Top churn file with no recent commits: abandoned code
- High churn on test files: unstable code under test

### Bus Factor Assessment
- One person with 60%+ commits: single point of failure
- Top contributor absent from 6-month window: critical knowledge gap
- Many historical contributors, few active ones: maintenance gap

### Velocity Patterns
- Steady rhythm: healthy team
- Declining curve over 6-12 months: momentum loss
- Spikes followed by quiet: release batching
- Sudden drop: team change or crisis

### Firefighting Signals
- Frequent reverts: broken deploy process or test gaps
- Zero matches: either stable or poor commit hygiene
- Many hotfixes: systemic quality issues

## Additional Aliases

For additional useful commands, see [aliases.md](references/aliases.md) which includes:
- `git summary` - Full statistics summary
- `git churn` - Simplified churn command
- `git whorank` - Contributors by count
- `git chart` - Activity visualization
- `git log-of-count-and-*` - Various time aggregations
- `git lost` / `git orphans` - Unreachable commits
- `git searchcommits` - Search patches
- `git refs-by-date` - Branches by date
