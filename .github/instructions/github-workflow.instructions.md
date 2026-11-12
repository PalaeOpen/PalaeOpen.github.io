---
description: "Use when working with git branches, commits, pull requests, or any GitHub workflow tasks for PalaeOpen. Covers branch naming, PR format, squash-merge policy, reviewer tagging, and the prohibition on agent-initiated merges."
---

# GitHub Workflow — PalaeOpen

## Copilot Cloud-Agent Exception

When these instructions run inside GitHub Copilot cloud agent, GitHub has already provisioned a `copilot/` branch and draft PR. In that environment:

- Work only on the current managed branch; do not create or switch branches.
- Do not run `git commit`, `git push`, or create another PR. GitHub's managed finalizer performs those operations after the session.
- Before finishing an implementation, verify `git status --short` and the staged/unstaged diff contain the intended files. An empty diff is not a completed implementation.
- Keep the PR in draft. Copilot cannot mark its own PR ready for review.

The manual commands below are for human/local workflows only.

## Manual Human/Local Workflow

The remaining branch, commit, and PR commands in this file are for maintainers working locally. They do not override the Copilot cloud-agent exception above.

### Branching

- **Always** create a new branch for every issue. Never commit to `main` directly.
- Branch naming: `issue[N]` or `issue[N]-short-description`
  - Examples: `issue42`, `issue42-add-basel-workshop`, `issue7-fix-event-dates`
- Branch from `main`:
  ```
  git checkout main
  git pull
  git checkout -b issue[N]-short-description
  ```

### Commits

- Commit often; each commit message must be meaningful and describe what changed.
- Commit **source files only** (`.qmd`, images, PDFs, config). Never commit `docs/` or `_preview/`: `docs/` is rendered and committed by the `Re-render site after merge` workflow after every merge into `main`. See [quarto-rendering.instructions.md](.github/instructions/quarto-rendering.instructions.md).
- Use imperative mood: `Add event page for Basel 2026`, not `Added` or `Adding`.

### Pull Requests

### Required PR Description Format

```
## Summary
[Brief description of what was changed and why]

## Changes
- [List of source files changed]

## Closes
- close #[issue number]

---
_Requested by @[issue author's GitHub handle]_
```

The `- close #[N]` line is **mandatory** — it links the PR to the issue and auto-closes it on merge.

### Checks

The `PR render check` workflow renders every PR and fails if the site does not build or if the PR changes `docs/`. Do not merge a PR whose check fails. If a branch contains `docs/` changes, restore them from `main` and commit:

```bash
git fetch origin main
git checkout origin/main -- docs/
git commit -m "docs: remove generated output from PR"
```

### Reviewers

Always assign **both** @OndrejMottl and @xbenitogranell as reviewers on every PR.

### Draft vs Ready

1. Open the PR as a **draft** first.
2. Invoke the `change-reviewer` subagent. Fix all flagged violations.
3. Mark the PR as **ready for review** only after the reviewer passes.

### Labels

Apply the same label(s) used on the source issue to the PR.

### Merge Policy

- Merges to `main` use **squash and merge** only. This keeps a clean git history.
- **The agent must NEVER merge a PR** unless a maintainer (@OndrejMottl or @xbenitogranell) explicitly gives the instruction to do so. This is rare.
- After a merge, delete the feature branch.

### Handling PR Feedback and Iteration

When a maintainer requests changes on an open PR:

1. **Rebase onto `main` first** — another PR may have been merged while this branch was open.
   ```bash
   git checkout main && git pull origin main
   git checkout issue[N]-short-description
   git rebase main
   ```
2. **Resolve `docs/` conflicts by accepting main** — PRs no longer touch `docs/`, so these should not occur; if one does (an older branch), take `main`'s version, since `docs/` is rebuilt after merge:
   ```bash
   git checkout --theirs docs/
   git add docs/
   git rebase --continue
   ```
3. **Apply the requested fixes**, optionally preview them locally (`quarto render --output-dir _preview`), and commit the source changes.
4. **Force-push with lease** (required after rebase):
   ```bash
   git push --force-with-lease origin issue[N]-short-description
   ```
5. **Re-invoke `change-reviewer`** and re-request review from @OndrejMottl and @xbenitogranell.

### When Blocked

If the agent encounters an unforeseen problem that prevents progress:

1. Post a comment on the issue explaining the blocker clearly.
2. Tag `@OndrejMottl` and/or `@xbenitogranell` for help.
3. Do not attempt workarounds that violate these instructions.
