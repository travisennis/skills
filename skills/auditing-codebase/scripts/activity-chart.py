#!/usr/bin/env python3
"""Render a per-author commit activity chart from `git log --format='%aE %at'`."""

from __future__ import annotations

import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta

DAYS = 42


def main() -> int:
    rows: list[tuple[str, int]] = []
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            author, timestamp = line.rsplit(" ", 1)
            rows.append((author, int(timestamp)))
        except ValueError:
            continue

    if not rows:
        print("No commits found.")
        return 0

    dates = [datetime.fromtimestamp(timestamp).date() for _, timestamp in rows]
    end = max(dates)
    start = min(min(dates), end - timedelta(days=DAYS - 1))
    days = [(start + timedelta(days=offset)) for offset in range((end - start).days + 1)]

    counts: dict[str, Counter[date]] = defaultdict(Counter)
    for author, timestamp in rows:
        counts[author][datetime.fromtimestamp(timestamp).date()] += 1

    print(f"Chart time range {start.isoformat()} to {end.isoformat()}.")
    for author, author_counts in sorted(
        counts.items(), key=lambda item: (-sum(item[1].values()), item[0])
    ):
        cells = []
        for day in days:
            count = author_counts[day]
            cells.append("." if count == 0 else str(count) if count < 10 else "X")
        print("".join(cells), author)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
