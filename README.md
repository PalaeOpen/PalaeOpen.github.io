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
- **Output:** `docs/` folder, rendered and committed automatically by CI after every merge into `main` (never changed in pull requests)
- **Styling:** `styles.scss` + `_colors.scss` + `colors.json`
- **Site config:** `_quarto.yml`
- **R pre-render script:** `R/_categorize_events.R`

---

## Issue → PR Workflow

All content requests come via structured GitHub Issue templates. The workflow follows these steps:

### 1. **Validate**

- A readiness check runs automatically whenever a template issue is opened or edited. It labels the issue `❓ status:needs-info` and lists what is missing in one status comment, or labels it `🤖 ready-for-copilot` and assigns the Copilot coding agent
- Add the `⏸️ no-agent` label to stop Copilot from being assigned automatically; maintainers can assign it by hand with the "Assign issue to Copilot (manual)" workflow
- The agent additionally checks referenced files and links; if anything is missing, it comments on the issue
- If blocked, tag @OndrejMottl or @xbenitogranell for help

### 2. **Branch**

- GitHub provisions a managed `copilot/` branch and draft PR for the coding agent
- Human contributors should create `issue[N]` or `issue[N]-short-description` branches
- **Never work on `main` directly**

### 3. **Implement**

- Write/edit `.qmd` files following the relevant instruction files (see below)
- Follow the project's code conventions and file naming standards

### 4. **Render (CI)**

- Pull requests contain **source files only**; never commit `docs/`
- The `PR render check` workflow renders every PR and fails if the site does not build or if `docs/` was changed
- After merge, the `Re-render site after merge` workflow renders the site into `docs/` and commits it
- To preview locally, run `quarto render --output-dir _preview` from the repository root, then discard the changes the pre-render hook (`R/_categorize_events.R`) makes to `events/` files

### 5. **Review**

- Invoke the `change-reviewer` subagent to validate all changes
- Address any flagged violations before continuing

### 6. **Open PR**

- Update the managed **draft** PR with:
  - Summary of changes
  - `- close #[issue number]`
  - `_Requested by @[issue author]_` footer
  - Tag @OndrejMottl and @xbenitogranell as reviewers
- A maintainer marks it ready after the change-reviewer and the PR render check pass
- A scheduled watchdog retries once if Copilot finishes but the PR still has no file changes, then alerts both maintainers if recovery fails
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
