# Git Aliases Reference

These aliases from [mattrighetti/dotfiles](https://github.com/mattrighetti/dotfiles) extend git with useful auditing commands. Apply them with `git config --local alias.<name> "<command>"` or add to `~/.gitconfig`.

## Alias Definitions

### Core Aliases (one letter)

```ini
a = add
b = branch
c = commit
d = diff
f = fetch
g = grep
l = log
m = merge
o = checkout
p = pull
r = remote
s = status
w = whatchanged
x = restore
```

### Log Aliases

```ini
# Text-based graph
lg = log --graph

# One line per commit
lo = log --oneline

# Patch output
lp = log --patch

# Topological order
lt = log --topo-order

# Summary format (KPI style)
ll = log --graph --topo-order --date=short --abbrev-commit --decorate --all --boundary --pretty=format:'%Cgreen%ad %Cred%h%Creset -%C(yellow)%d%Creset %s %Cblue[%cn]%Creset %Cblue%G?%Creset'

# Long summary format
lll = log --graph --topo-order --date=iso8601-strict --no-abbrev-commit --abbrev=40 --decorate --all --boundary --pretty=format:'%Cgreen%ad %Cred%h%Creset -%C(yellow)%d%Creset %s %Cblue[%cn <%ce>]%Creset %Cblue%G?%Creset'

# First parent only (for PR-based workflows)
lfp = log --first-parent

# Log by time periods
log-hour  = log --since=1-hour-ago
log-day   = log --since=1-day-ago
log-week  = log --since=1-week-ago
log-month = log --since=1-month-ago
log-year  = log --since=1-year-ago

# My commits only
log-my = !git log --author $(git config user.email)

# Log in reverse (oldest first)
log-changes = log --oneline --reverse
```

### Churn Analysis

```ini
# Show files with most changes
churn = !"f() { git log --all --find-copies --find-renames --name-only --format='format:' \"$@\" | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn;};f"
```

### Contributor Analysis

```ini
# Summary of contributors
whorank = shortlog --summary --numbered --no-merges

# Who contributed
who = shortlog --summary --

# Commits by author
whois = "!sh -c 'git log --regexp-ignore-case -1 --pretty=\"format:%an <%ae>\n\" --author=\"$1\"' -"

# Commits by email
log-of-count-and-email = "!f() { git log-of-count-and-format \"%aE\" $@; }; f"
log-of-email-and-count = "!f() { git log-of-format-and-count \"%aE\" $@; }; f"
```

### Time-Based Analysis

```ini
# Commits by day
log-of-count-and-day = "!f() { git log-of-count-and-format-with-date \"%ad\" \"%Y-%m-%d\" $@ ; }; f"

# Commits by week
log-of-count-and-week = "!f() { git log-of-count-and-format-with-date \"%ad\" \"%Y#%V\" $@ ; }; f"

# Commits by month
log-of-count-and-month = "!f() { git log-of-count-and-format-with-date \"%ad\" \"%Y-%m\" $@ ; }; f"

# Commits by hour of day
log-of-count-and-hour-of-day = "!f() { git log-of-count-and-format-with-date \"%ad\" \"%H\" $@; }; f"
```

### Activity Chart

```ini
# Activity chart per author (6 weeks default)
chart = "!f() { \
  git log \
  --format=oneline \
  --format=\"%aE %at\" \
  --since=6-weeks-ago \
  $* | \
  awk ' \
  function time_to_slot(t) { return strftime(\"%Y-%m-%d\", t, true) } \
  function count_to_char(i) { return (i > 0) ? ((i < 10) ? i : \"X\") : \".\" } \
  BEGIN { time_min = systime(); time_max = 0; SECONDS_PER_DAY=86400; } \
  { item = $1; time = 0 + $2; if (time > time_max){ time_max = time } else if (time < time_min){ time_min = time }; slot = time_to_slot(time); items[item]++; slots[slot]++; views[item, slot]++; } \
  END{ printf(\"Chart time range %s to %s.\n\", time_to_slot(time_min), time_to_slot(time_max)); time_max_add = time_max += SECONDS_PER_DAY; for(item in items){ row = \"\"; for(time = time_min; time < time_max_add; time += SECONDS_PER_DAY) { slot = time_to_slot(time); count = views[item, slot]; row = row count_to_char(count); } print row, item; } } \
  }; \
}; f"
```

### Summary Report

```ini
# Full repo summary
summary = "!f() { \
  printf \"Summary of this branch...\n\"; \
  printf \"%s\n\" $(git rev-parse --abbrev-ref HEAD); \
  printf \"%s first commit timestamp\n\" $(git log --date-order --format=%cI | tail -1); \
  printf \"%s latest commit timestamp\n\" $(git log -1 --date-order --format=%cI); \
  printf \"%d commit count\n\" $(git rev-list --count HEAD); \
  printf \"%d date count\n\" $(git log --format=oneline --format=\"%ad\" --date=format:\"%Y-%m-%d\" | awk '{a[$0]=1}END{for(i in a){n++;} print n}'); \
  printf \"%d tag count\n\" $(git tag | wc -l); \
  printf \"%d author count\n\" $(git log --format=oneline --format=\"%aE\" | awk '{a[$0]=1}END{for(i in a){n++;} print n}'); \
  printf \"%d local branch count\n\" $(git branch | grep -v \" -> \" | wc -l); \
  printf \"%d remote branch count\n\" $(git branch -r | grep -v \" -> \" | wc -l); \
  printf \"\nMost-active authors, with commit count and %%...\n\"; git log-of-count-and-email | head -7; \
  printf \"\nMost-active dates, with commit count and %%...\n\"; git log-of-count-and-day | head -7; \
  printf \"\nMost-active files, with churn count\n\"; git churn | head -7; \
}; f"
```

### Search Aliases

```ini
# Search commits for string (searches patches)
searchcommits = !"f() { query=\"$1\"; shift; git log -S\"$query\" \"$@\"; }; f \"$@\""

# Search all commits ever
grep-all = !"f() { git rev-list --all | xargs git grep \"$@\"; }; f"

# Grouped grep output
gg = grep --break --heading --line-number --color
```

### Lost/Orphan Detection

```ini
# Find dangling commits
lost = !"git fsck | awk '/dangling commit/ {print $3}' | git show --format='SHA1: %h %f' --annotate-stdin"

# Find orphan commits
orphans = fsck --full
```

### Diff Aliases

```ini
# Deep diff with find copies/renames
dd = diff --check --dirstat --find-copies --find-renames --histogram --color
diff-deep = diff --check --dirstat --find-copies --find-renames --histogram --color

# Staged diff
dc = diff --cached
ds = diff --staged

# Word diff
dw = diff --word-diff

# Diff all changed files
diff-all = !"for name in $(git diff --name-only $1); do git difftool $1 $name & done"

# Diff stat
diff-stat = diff --stat --ignore-space-change -r
```

### Branch Analysis

```ini
# Branches sorted by recent activity
refs-by-date = for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)'

# Merged branches
bm = branch --merged

# Unmerged branches
bnm = branch --no-merged
```

### Commit Analysis

```ini
# Show commit with pretty format
whatis = show --no-patch --pretty='tformat:%h (%s, %ad)' --date=short

# Latest tag
lasttag = describe --tags --abbrev=0

# First and latest commit dates
log-first-date = !"git log --date-order --format=%cI | tail -1"
log-latest-date = log -1 --date-order --format=%cI

# List issues from commits
issues = !sh -c \"git log $1 --oneline | grep -o \\\"ISSUE-[0-9]\\+\\\" | sort -u\"
```

### Remote/Branch Workflow

```ini
# Show incoming changes
incoming = !git remote update --prune; git log ..@{upstream}

# Show outgoing changes
outgoing = log @{upstream}..

# Reflog
rl = reflog

# Remote prune
rrp = remote prune
rru = remote update
```

### Status Shortcuts

```ini
# Short status
ss = status --short
ssb = status --short --branch

# Status without untracked
st = status -uno
```

### Cleanup Commands

```ini
# Clean to pristine
cleanest = clean -ffdx

# Reset to upstream
reset-to-upstream = !git reset --hard $(git upstream-name)
```

## Installation

To use these aliases, add them to your `~/.gitconfig` under `[alias]` section, or run individual aliases as git commands directly.
