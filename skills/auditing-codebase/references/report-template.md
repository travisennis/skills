# Codebase Audit Report: [Repository Name]

## Audit Metadata

| Field | Value |
|-------|-------|
| Repository | [name or path] |
| Branch | [branch name] |
| Audit date | [YYYY-MM-DD] |
| Commit analyzed | [short SHA] |
| Time window | [e.g. all-time, 1 year, 6 months] |
| Audit depth | [quick / standard / deep] |

## Executive Summary

[One short paragraph summarizing repository health, major risks, and the most important action to take next.]

## Headline Findings

| Severity | Finding | Evidence | Recommendation |
|----------|---------|----------|----------------|
| [High/Medium/Low] | [What was found] | [Metric, command output summary, or file path] | [Action to take] |

## Repository Snapshot

| Metric | Value | Notes |
|--------|-------|-------|
| Total commits | [count] | [scope] |
| Tracked files | [count] | [scope] |
| Contributors | [count] | [all-time or window] |
| Active contributors | [count] | [recent window] |
| First commit | [date] | [optional author/sha] |
| Latest commit | [date] | [optional author/sha] |
| Tags | [count] | [release signal] |
| Local branches | [count] | [optional] |
| Remote branches | [count] | [optional] |

## Churn Hotspots

| Rank | File or Area | Change Count | Risk Signal | Notes |
|------|--------------|--------------|-------------|-------|
| 1 | [path] | [count] | [why it matters] | [context] |

## Bug Hotspots

| Rank | File or Area | Fix/Bug Commit Count | Related Churn? | Notes |
|------|--------------|----------------------|----------------|-------|
| 1 | [path] | [count] | [yes/no] | [context] |

## Contributor and Ownership Analysis

| Contributor | Commits | Share | Recent Activity | Ownership Risk |
|-------------|---------|-------|-----------------|----------------|
| [name/email] | [count] | [percent] | [active/inactive/window] | [low/medium/high] |

**Bus factor assessment**: [Brief assessment of concentration risk and knowledge gaps.]

## Velocity and Maintenance Trends

| Period | Commit Count | Interpretation |
|--------|--------------|----------------|
| [YYYY-MM or week] | [count] | [trend note] |

**Trend summary**: [Steady, declining, spiky, dormant, or other pattern with evidence.]

## Firefighting and Stability Signals

| Signal | Count / Evidence | Interpretation |
|--------|------------------|----------------|
| Reverts | [count or examples] | [meaning] |
| Hotfixes / emergencies | [count or examples] | [meaning] |
| Rollbacks | [count or examples] | [meaning] |

## Branch and Release Hygiene

| Area | Observation | Risk |
|------|-------------|------|
| Branch age/activity | [summary] | [low/medium/high] |
| Merged branches | [summary] | [low/medium/high] |
| Unmerged branches | [summary] | [low/medium/high] |
| Tags/releases | [summary] | [low/medium/high] |

## Risk Register

| Risk | Severity | Evidence | Impact | Suggested Owner |
|------|----------|----------|--------|-----------------|
| [risk name] | [High/Medium/Low] | [data point] | [why it matters] | [team/person if known] |

## Recommendations

1. **[Recommendation title]**: [Specific action, expected benefit, and where to start.]
2. **[Recommendation title]**: [Specific action, expected benefit, and where to start.]
3. **[Recommendation title]**: [Specific action, expected benefit, and where to start.]

## Commands Run

| Purpose | Command | Notes |
|---------|---------|-------|
| [why run] | `[command]` | [time window, filters, caveats] |

## Gaps and Caveats

- [What could not be evaluated, why, and how it affects confidence.]
- [Any missing history, shallow clone limitation, unavailable remotes, or noisy commit hygiene.]

## Appendix: Raw Evidence

[Include only concise excerpts needed to support the report. Do not paste large raw command outputs unless the user explicitly asks.]
