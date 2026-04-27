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
| Output | `docs/` folder — **committed to the repository** |
| Styling | `styles.scss` + `_colors.scss` + `colors.json` |
| Site config | `_quarto.yml` |
| R pre-render script | `R/_categorize_events.R` |

## Rendering Process

Rendering is done locally (or in the agent environment) with:

```
quarto render
```

Run from the **repository root**. This command:
1. Executes `R/_categorize_events.R` (pre-render hook configured in `_quarto.yml`)
2. Renders all `.qmd` files to HTML
3. Writes output to `docs/`

The `docs/` folder output **must be committed** alongside the source `.qmd` changes in the same branch and PR.
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

## Agent Workflow (Issue → PR)

When assigned an issue, the agent must follow this sequence:

1. **Validate** — Check all required issue fields are present.
   If any are missing, post a comment tagging the issue submitter requesting the missing info.
   If blocked by an unforeseen problem, tag @OndrejMottl or @xbenitogranell for help.

2. **Branch** — Create a new branch named `issue[N]` or `issue[N]-short-description` (e.g., `issue42-add-basel-workshop`).
   Never work on `main` directly.

3. **Implement** — Write/edit `.qmd` files following the relevant instruction files.

4. **Render** — Run `quarto render` and commit the `docs/` output.

5. **Review** — Invoke the `change-reviewer` subagent.
   Fix any flagged violations before continuing.

6. **Open PR** — Create a **draft** PR initially. The description must include:
   - Summary of changes
   - `- close #[issue number]`
   - Tag @OndrejMottl and @xbenitogranell as reviewers
   Mark as ready for review only after the change-reviewer passes.

> **The agent must NEVER merge a PR** unless explicitly instructed by a maintainer.

## Instruction Files

Load the relevant instruction file for each task:

| Task | Instruction file |
|------|-----------------|
| Writing `.qmd` files | [quarto-writing.instructions.md](.github/instructions/quarto-writing.instructions.md) |
| Rendering and committing `docs/` | [quarto-rendering.instructions.md](.github/instructions/quarto-rendering.instructions.md) |
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
