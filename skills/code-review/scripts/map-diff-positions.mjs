#!/usr/bin/env node
// Map review finding evidence (file:line) to commentable GitHub PR diff positions.
//
// GitHub inline review comments can only attach to lines shown in the PR diff. This
// script reads a PR diff and a list of evidence entries, and reports where each one
// can be commented inline (RIGHT = new file, LEFT = old file / deleted line) or why
// it must go in the review body instead.
//
// Usage:
//   node map-diff-positions.mjs --pr <number> --evidence findings.json
//   node map-diff-positions.mjs --diff <diff-file> --evidence findings.json
//
// findings.json is an array of:
//   [ { "id": "F-001", "file": "src/a.ts", "line": 42 }, ... ]
//
// Output (JSON to stdout, one entry per input item, in order):
//   { "id": "F-001", "commentable": true,  "position": { "path": "src/a.ts", "line": 42, "side": "RIGHT" } }
//   { "id": "F-002", "commentable": false, "reason": "..." }

import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const USAGE = `Usage:
  node map-diff-positions.mjs --pr <number> --evidence findings.json
  node map-diff-positions.mjs --diff <diff-file> --evidence findings.json

findings.json: [ { "id": "F-001", "file": "src/a.ts", "line": 42 }, ... ]`;

function fail(msg) {
  console.error(`error: ${msg}`);
  console.error(USAGE);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    pr: { type: 'string' },
    diff: { type: 'string' },
    evidence: { type: 'string' },
  },
});

if (!values.evidence) fail('--evidence is required');
if (!values.pr && !values.diff) fail('one of --pr or --diff is required');

// 1. Load the diff
let diffText;
if (values.diff) {
  diffText = readFileSync(values.diff, 'utf8');
} else {
  const res = spawnSync('gh', ['pr', 'diff', values.pr], { encoding: 'utf8' });
  if (res.status !== 0) {
    fail(`gh pr diff ${values.pr} failed: ${(res.stderr || res.stdout || '').trim()}`);
  }
  diffText = res.stdout;
}

// 2. Load evidence
let evidence;
try {
  evidence = JSON.parse(readFileSync(values.evidence, 'utf8'));
} catch (err) {
  fail(`cannot read/parse --evidence file: ${err.message}`);
}
if (!Array.isArray(evidence)) fail('--evidence must be a JSON array');

// 3. Parse the unified diff into per-file line sets
function stripPrefix(p) {
  if (p.startsWith('a/')) return p.slice(2);
  if (p.startsWith('b/')) return p.slice(2);
  return p;
}

function parseDiff(text) {
  const files = new Map(); // repo-relative new path -> { path, oldPath, rightLines, leftLines }
  const sections = text.split(/(?=^diff --git )/m);

  for (const section of sections) {
    if (!section.startsWith('diff --git')) continue;

    let oldPath = null;
    let newPath = null;
    const rightLines = new Set(); // new-file line numbers in hunks (added + context)
    const leftLines = new Set(); // old-file line numbers in hunks (deleted + context)

    const lines = section.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('--- ')) {
        oldPath = stripPrefix(line.slice(4).trim());
      } else if (line.startsWith('+++ ')) {
        newPath = stripPrefix(line.slice(4).trim());
      } else if (line.startsWith('rename from ')) {
        oldPath = stripPrefix(line.slice('rename from '.length).trim());
      } else if (line.startsWith('rename to ')) {
        newPath = stripPrefix(line.slice('rename to '.length).trim());
      } else if (line.startsWith('@@')) {
        const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (!m) continue;
        let oldLine = Number(m[1]);
        let newLine = Number(m[3]);
        for (let j = i + 1; j < lines.length; j++) {
          const body = lines[j];
          if (body.startsWith('@@') || body.startsWith('diff --git')) {
            i = j - 1;
            break;
          } else if (body.startsWith('+')) {
            rightLines.add(newLine);
            newLine += 1;
          } else if (body.startsWith('-')) {
            leftLines.add(oldLine);
            oldLine += 1;
          } else if (body.startsWith(' ')) {
            rightLines.add(newLine);
            leftLines.add(oldLine);
            newLine += 1;
            oldLine += 1;
          } else if (body.startsWith('\\')) {
            // "\ No newline at end of file"
            continue;
          } else {
            // Unexpected (e.g. empty) line inside a hunk; treat as context.
            rightLines.add(newLine);
            leftLines.add(oldLine);
            newLine += 1;
            oldLine += 1;
          }
        }
      }
    }

    // Deleted files (/dev/null on the right) are body-only: no inline comments.
    if (newPath && newPath !== '/dev/null') {
      files.set(newPath, { path: newPath, oldPath, rightLines, leftLines });
    }
  }
  return files;
}

const files = parseDiff(diffText);

// 4. Map evidence to positions
function mapLine(base, path, line, entry) {
  if (entry.rightLines.has(line)) {
    return { ...base, commentable: true, position: { path, line, side: 'RIGHT' } };
  }
  if (entry.leftLines.has(line)) {
    return { ...base, commentable: true, position: { path, original_line: line, side: 'LEFT' } };
  }
  return {
    ...base,
    commentable: false,
    reason: `line ${line} is not inside a diff hunk of ${path}`,
  };
}

const results = evidence.map((item) => {
  const { id, file, line } = item;
  const base = { id: id ?? null };

  if (typeof file !== 'string' || !Number.isInteger(line) || line < 1) {
    return { ...base, commentable: false, reason: 'invalid evidence: file (string) and line (positive integer) required' };
  }

  const entry = files.get(file);
  if (!entry) {
    // Match against the old path too (renamed files); comment on the new path.
    const renamed = [...files.values()].find((f) => f.oldPath === file);
    if (!renamed) {
      return { ...base, commentable: false, reason: `file "${file}" is not in the PR diff` };
    }
    return mapLine(base, renamed.path, line, renamed);
  }
  return mapLine(base, file, line, entry);
});

console.log(JSON.stringify(results, null, 2));
