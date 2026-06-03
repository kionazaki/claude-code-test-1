---
name: pre-commit-review
description: use this skill when the user asks to review local code changes before committing, check git diff, find obvious bugs, improve tests, or prepare a safe commit plan. especially useful in claude code inside a git repository before running git commit or opening a pull request.
---

# Pre-commit Review

## Purpose

Help review the current repository changes before commit. Focus on practical issues that could break production, tests, security, or maintainability. Do not rewrite unrelated code.

## When to use

Use this skill when the user says things like:

- "review my changes before commit"
- "check the diff"
- "is this safe to commit?"
- "find bugs in my branch"
- "prepare a commit summary"
- "what tests should I run before pushing?"

## Workflow

1. Inspect the working tree:
   - Run `git status --short`.
   - Run `git diff --stat`.
   - Run `git diff` for unstaged changes.
   - If staged changes exist, also run `git diff --cached`.

2. Understand the intent:
   - Infer the likely purpose of the change from filenames, diff, tests, and nearby code.
   - If the diff is large, summarize by area first instead of reading everything linearly.

3. Review with this priority order:
   - Correctness bugs and edge cases.
   - Security or data exposure risks.
   - Backward compatibility and API contract changes.
   - Missing or weak tests.
   - Error handling and observability.
   - Simplicity and maintainability.

4. Run checks only when safe:
   - Prefer existing project commands from README, package scripts, Makefile, pyproject, Cargo.toml, etc.
   - Ask before running destructive commands, database migrations, deploy commands, or commands that modify external services.
   - For normal local checks, suggest or run the narrowest relevant tests first.

5. Produce a compact review.

## Output format

Use this structure:

```markdown
## Pre-commit review

### Summary
- One or two sentences explaining what changed.

### Findings
- [severity: high|medium|low] File/path:line — issue and why it matters.
- Include a suggested fix when possible.

### Tests/checks
- What was run and the result, or what should be run next.

### Commit suggestion
Suggested commit message:
`type(scope): short description`
```

If there are no meaningful issues, say so directly and still mention the checks reviewed.

## Guardrails

- Do not commit, push, rebase, reset, or delete files unless the user explicitly asks.
- Do not expose secrets found in diffs; say that a secret-like value appears and recommend rotation/removal.
- Do not make broad refactors during review unless explicitly requested.
- If a generated file or lockfile changed, check whether it matches the source/config change that should have produced it.
