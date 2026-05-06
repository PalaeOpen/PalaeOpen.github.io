# PalaeOpen.github.io

Code for the **PalaeOpen** website at <https://palaeopen.github.io/>

PalaeOpen is the COST Action **Open Palaeoecological Data** (CA23116), funded by the European Cooperation in Science and Technology (COST). The website is maintained by the PalaeOpen core group and community members who submit content requests via GitHub Issues.

**Maintainers:** @OndrejMottl (primary), @xbenitogranell

---

## How to Submit Content Requests

**PalaeOpen members**: To request changes to the website, follow these steps:

1. **Go to the [Issues](https://github.com/PalaeOpen/PalaeOpen.github.io/issues) page** on GitHub
2. **Click "New Issue"**
3. **Choose the appropriate template** based on your request type (see table below)
4. **Fill in all required fields** marked with `*` in the template
5. **Submit the issue** — the maintenance team will process it

What happens next:

- The maintenance team reviews your request
- They create a branch and implement the changes
- The website is updated, and your issue is closed via a pull request
- Changes are typically live within a few days

---

## Issue Templates

Use one of these structured templates when submitting your content request:

| Template | Purpose | Use when... |
|----------|---------|-----------|
| `01_new_content.yml` | Brand-new page, post, or section | Adding an entirely new page to the website |
| `02_update_content.yml` | Edits to existing page | Making changes to a page that already exists |
| `03_media_request.yml` | Image, logo, or media upload | Uploading new images, logos, or other files |
| `04_event_post.yml` | New or updated event announcement | Announcing a workshop, training school, meeting, or conference |
| `05_grant_call.yml` | Grant / STSM call pages | Publishing grant calls or STSM opportunities |
| `06_archive_remove.yml` | Archive or remove content | Removing or archiving outdated content |
| `07_website_bug.yml` | Bug report | Reporting a broken link, display issue, or other technical problem |

---

## Technology Stack

- **Static site generator:** [Quarto](https://quarto.org/)
- **Source files:** `*.qmd` files (YAML frontmatter + Markdown/R)
- **Output:** `docs/` folder (committed to the repository)
- **Styling:** `styles.scss` + `_colors.scss` + `colors.json`
- **Site config:** `_quarto.yml`
- **R pre-render script:** `R/_categorize_events.R`

---

## Issue → PR Workflow

All content requests come via structured GitHub Issue templates. The workflow follows these steps:

### 1. **Validate**

- Check that all required issue fields are present
- If any fields are missing, post a comment requesting the missing information
- If blocked, tag @OndrejMottl or @xbenitogranell for help

### 2. **Branch**

- Create a new branch: `issue[N]` or `issue[N]-short-description`
- Example: `issue42-add-basel-workshop`
- **Never work on `main` directly**

### 3. **Implement**

- Write/edit `.qmd` files following the relevant instruction files (see below)
- Follow the project's code conventions and file naming standards

### 4. **Render**

- Run `quarto render` from the repository root
- This command:
  - Executes `R/_categorize_events.R` (pre-render hook)
  - Renders all `.qmd` files to HTML
  - Writes output to `docs/`
- **Commit the `docs/` output alongside the source `.qmd` changes**

### 5. **Review**

- Invoke the `change-reviewer` subagent to validate all changes
- Address any flagged violations before continuing

### 6. **Open PR**

- Create a **draft** PR with:
  - Summary of changes
  - `- close #[issue number]`
  - Tag @OndrejMottl and @xbenitogranell as reviewers
- Mark as ready for review only after change-reviewer passes
- **Agents must NEVER merge a PR** unless explicitly instructed by a maintainer

---

## Content Areas

| Area | Source files | Deployed URL |
|------|-------------|-------------|
| Home | `index.qmd` | `/` |
| About | `About/*.qmd` | `/About/` |
| Core Group | `coregroup.qmd` | `/coregroup` |
| Events | `events/YYYY/event_name_YYYY.qmd` | `/events/YYYY/` |
| Grants / STSM | `grants/stms/stms_YYYY[_Ncall].qmd` | `/grants/stms/` |
| Outreach | `outreach/*.qmd` | `/outreach/` |
| Meeting reports | `outreach/meetings/individual_reports/*.qmd` | `/outreach/meetings/` |
| Materials | `Materials/` | `/Materials/` |

---

## Instruction Files

Follow these guides when working on specific tasks:

- **Writing `.qmd` files:** [quarto-writing.instructions.md](.github/instructions/quarto-writing.instructions.md)
- **Rendering and committing:** [quarto-rendering.instructions.md](.github/instructions/quarto-rendering.instructions.md)
- **Branch / PR / Git workflow:** [github-workflow.instructions.md](.github/instructions/github-workflow.instructions.md)
- **Reviewing changes:** [review.instructions.md](.github/instructions/review.instructions.md)
- **Event pages:** [events.instructions.md](.github/instructions/events.instructions.md)
- **Grant / STSM pages:** [grants.instructions.md](.github/instructions/grants.instructions.md)

---

## Getting Help

- **Ondřej Mottl's [Collaboration Guide](https://ondrejmottl.github.io/collaboration/collaboration_guide.html)**
- **Ondřej Mottl's [Code Convention](https://ondrejmottl.github.io/collaboration/code_convention.html)**
