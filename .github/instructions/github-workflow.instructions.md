---
description: "Use when working with git branches, commits, pull requests, or any GitHub workflow tasks for PalaeOpen. Covers branch naming, PR format, squash-merge policy, reviewer tagging, and the prohibition on agent-initiated merges."
---

# GitHub Workflow — PalaeOpen

## Branching

- **Always** create a new branch for every issue. Never commit to `main` directly.
- Branch naming: `issue[N]` or `issue[N]-short-description`
  - Examples: `issue42`, `issue42-add-basel-workshop`, `issue7-fix-event-dates`
- Branch from `main`:
  ```
  git checkout main
  git pull
  git checkout -b issue[N]-short-description
  ```

## Commits

- Commit often; each commit message must be meaningful and describe what changed.
- Commit source (`.qmd`) changes and `docs/` output together in the same commit (or as consecutive commits on the same branch before the PR is opened).
- Use imperative mood: `Add event page for Basel 2026`, not `Added` or `Adding`.

## Pull Requests

### Required PR Description Format

```
## Summary
[Brief description of what was changed and why]

## Changes
- [List of files changed]

## Closes
- close #[issue number]
```

The `- close #[N]` line is **mandatory** — it links the PR to the issue and auto-closes it on merge.

### Reviewers

Always assign **both** @OndrejMottl and @xbenitogranell as reviewers on every PR.

### Draft vs Ready

1. Open the PR as a **draft** first.
2. Invoke the `change-reviewer` subagent. Fix all flagged violations.
3. Mark the PR as **ready for review** only after the reviewer passes.

### Labels

Apply the same label(s) used on the source issue to the PR.

## Merge Policy

- Merges to `main` use **squash and merge** only. This keeps a clean git history.
- **The agent must NEVER merge a PR** unless a maintainer (@OndrejMottl or @xbenitogranell) explicitly gives the instruction to do so. This is rare.
- After a merge, delete the feature branch.

## When Blocked

If the agent encounters an unforeseen problem that prevents progress:

1. Post a comment on the issue explaining the blocker clearly.
2. Tag `@OndrejMottl` and/or `@xbenitogranell` for help.
3. Do not attempt workarounds that violate these instructions.
