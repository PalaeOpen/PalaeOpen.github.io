# PalaeOpen Website — Copilot Instructions

## Project Overview

This repository hosts the **PalaeOpen** website at <https://palaeopen.github.io/>.
PalaeOpen is the COST Action **Open Palaeoecological Data** (CA23116), funded by the European Cooperation in Science and Technology (COST).
The website is maintained by the PalaeOpen core group and community members who submit content requests via GitHub Issues using structured templates.

**Maintainers:** @OndrejMottl (primary), @xbenitogranell

## Technology Stack

| Component | Details |
|-----------|---------|
| Static site generator | [Quarto](https://quarto.org/) |
| Source files | `*.qmd` files (YAML frontmatter + Markdown/R) |
| Output | `docs/` folder — generated **only** by the `Re-render site after merge` workflow; never changed in PRs |
| Styling | `styles.scss` + `_colors.scss` + `colors.json` |
| Site config | `_quarto.yml` |
| R pre-render script | `R/_categorize_events.R` |

## Rendering Process

Rendering is done by CI, not in PRs:

- The `PR render check` workflow renders every PR (into a throwaway folder) and fails if the site does not build or if the PR changes `docs/`.
- The `Re-render site after merge` workflow renders the site into `docs/` after every merge into `main` and commits it.

**PRs contain source changes only. Never commit `docs/`.** The Copilot coding agent does not render at all (no R, `{renv}`, or Quarto setup). Humans can preview locally with `quarto render --output-dir _preview`; a render runs `R/_categorize_events.R`, which rewrites event files, so discard those changes before committing.
See [quarto-rendering.instructions.md](.github/instructions/quarto-rendering.instructions.md).

> **Important:** Do not manually run `R/_categorize_events.R`.
> It runs automatically as part of `quarto render`.
> Do not manually set the `categories:` field in event `.qmd` files — the script overwrites it.

## Event Auto-Categorisation

`R/_categorize_events.R` compares `event-date` (or `event-end-date`) against the current system date and sets `categories: Future` or `categories: Past` in each event `.qmd` file.
It also regenerates `events/events.qmd` with the correct file listings.
**Never hand-edit `events/events.qmd`.**

## Content Areas and File Paths

| Area | Source files | Deployed URL prefix |
|------|-------------|---------------------|
| Home | `index.qmd` | `/` |
| About | `About/*.qmd` | `/About/` |
| Core Group | `coregroup.qmd` | `/coregroup` |
| Events | `events/YYYY/event_name_YYYY.qmd` | `/events/YYYY/` |
| Grants / STSM | `grants/stms/stms_YYYY[_Ncall].qmd` | `/grants/stms/` |
| Outreach | `outreach/*.qmd` | `/outreach/` |
| Meeting reports | `outreach/meetings/individual_reports/*.qmd` | `/outreach/meetings/` |
| Materials | `Materials/` (images, logos, flyers) | `/Materials/` |

## Issue Templates

All content requests come via one of these structured GitHub Issue templates:

| File | Purpose |
|------|---------|
| `01_new_content.yml` | Brand-new page, post, or section |
| `02_update_content.yml` | Edits to existing page |
| `03_media_request.yml` | Image, logo, or media upload |
| `04_event_post.yml` | New or updated event announcement |
| `05_grant_call.yml` | Grant / STSM call pages |
| `06_archive_remove.yml` | Archive or remove content |
| `07_website_bug.yml` | Bug report |
| `08_stsm_blogpost.yml` | STSM blog post submission from funded activity |

Routing note:
- Use `05_grant_call.yml` for grant/STSM call page creation and updates.
- Use `08_stsm_blogpost.yml` for post-STSM blog submissions from funded activities.

## Issue Automation

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `copilot-readiness-check.yml` | issue opened, edited, reopened, (un)labelled | Runs `.github/scripts/issue-readiness-check.js` on template issues, sets labels, keeps one status comment for the submitter, and assigns Copilot (via `.github/scripts/assign-copilot.js`) once the issue is complete. |
| `copilot-assign.yml` | manual (`workflow_dispatch`) | Assigns Copilot to any issue, ignoring the labels — for issues without a template or to restart Copilot. |
| `copilot-empty-pr-watchdog.yml` | schedule | Retries once if a Copilot PR ends with no file changes, then alerts the maintainers. |
| `pr-render-check.yml` | pull request | Renders the PR and rejects `docs/` changes. |

Labels:
- `🤖 ready-for-copilot` — the issue passed the readiness check; Copilot is assigned automatically.
- `❓ status:needs-info` — the readiness check found missing information; its status comment lists what.
- `⏸️ no-agent` — opt-out: Copilot is never assigned automatically.

Issues opened without a template get no labels, comments, or Copilot assignment.

## Agent Workflow (Issue → PR)

When assigned an issue, the agent must follow this sequence:

1. **Validate** — Check all required issue fields are present (the readiness check has already done the field checks for template issues), and check the referenced files and links.
   If anything is missing, post a comment tagging the issue submitter requesting the missing info.
   If blocked by an unforeseen problem, tag @OndrejMottl or @xbenitogranell for help.

2. **Branch** — Work on the current `copilot/` branch and draft PR provisioned by GitHub. Never work on `main`, create another branch, or open another PR from the cloud-agent session.

3. **Implement** — Write/edit `.qmd` files following the relevant instruction files.

4. **Verify a source-only diff** — Do not render. Confirm the diff contains the intended source files and nothing under `docs/`, `_preview/`, `events/events.qmd`, or event `categories:` lines.

5. **Review** — Invoke the `change-reviewer` subagent.
   Fix any flagged violations before continuing.

6. **Prepare PR** — Update the existing **draft** PR summary. It must include:
   - Summary of changes (source files only)
   - `- close #[issue number]`
   - `_Requested by @[issue author]_` footer
   - Tag @OndrejMottl and @xbenitogranell as reviewers
   - `<!-- copilot-implementation-attempted -->` after a non-empty implementation

Before finishing, verify that `git status --short` and the staged/unstaged diff contain the intended changed files. Do not report a completed implementation with an empty diff. Do not run `git commit`, `git push`, or create a PR manually; GitHub's managed finalizer performs those operations. Keep the PR in draft for a maintainer to mark ready.

> **The agent must NEVER merge a PR** unless explicitly instructed by a maintainer.

## Instruction Files

Load the relevant instruction file for each task:

| Task | Instruction file |
|------|-----------------|
| Writing `.qmd` files | [quarto-writing.instructions.md](.github/instructions/quarto-writing.instructions.md) |
| Rendering (and why `docs/` is never committed in PRs) | [quarto-rendering.instructions.md](.github/instructions/quarto-rendering.instructions.md) |
| Branch / PR / Git workflow | [github-workflow.instructions.md](.github/instructions/github-workflow.instructions.md) |
| Reviewing changes | [review.instructions.md](.github/instructions/review.instructions.md) |
| Event pages | [events.instructions.md](.github/instructions/events.instructions.md) |
| Grant / STSM pages | [grants.instructions.md](.github/instructions/grants.instructions.md) |

## Custom Agents

| Agent | Purpose |
|-------|---------|
| `website-maintainer` | Orchestrates the full issue → PR workflow |
| `change-reviewer` | Validates changes before a PR is opened (subagent) |

## Collaboration References

- Ondřej Mottl's [Collaboration Guide](https://ondrejmottl.github.io/collaboration/collaboration_guide.html)
- Ondřej Mottl's [Code Convention](https://ondrejmottl.github.io/collaboration/code_convention.html)
