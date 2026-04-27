---
description: "Use when creating or editing any .qmd (Quarto Markdown) file in the PalaeOpen website. Covers required frontmatter fields, YAML syntax rules, Quarto callout and listing patterns, file naming conventions, and Markdown style."
applyTo: "**/*.qmd"
---

# Writing Quarto (`.qmd`) Files — PalaeOpen

## Required Frontmatter Fields

Every `.qmd` file must include at minimum:

```yaml
---
date: YYYY/MM/DD          # creation or last-significant-update date
date-format: long
date-modified: last-modified
sidebar: false
---
```

Additional fields by page type — see [events.instructions.md](.github/instructions/events.instructions.md) and [grants.instructions.md](.github/instructions/grants.instructions.md).

## YAML Syntax Rules

- Use **spaces only** — no tab characters.
- Quote any string value that contains a colon (`:`).
- Dates follow `YYYY/MM/DD` (forward slashes, not hyphens) in frontmatter.
- Boolean values: `true` / `false` (lowercase).
- `sidebar: false` (not `sidebar: no` — both work, but `false` is preferred for new files; match the existing style of the file being edited).

## File Naming

- Use `snake_case` for all file and folder names.
- For event pages: `event_name_YYYY.qmd` (e.g., `basel_workshop_2026.qmd`).
- For grant pages: `stms_YYYY[_NNcall].qmd` (e.g., `stms_2026_3rdcall.qmd`).
- For meeting reports: `author_city_YYYY.qmd`.
- Do not include spaces or uppercase letters in filenames.

## Headings

- Use `#` for the top-level page heading (only one per file).
- Use `##` for major sections, `###` for subsections.
- Heading text starts with a capital letter.

## Callout Blocks

Use Quarto callout syntax for highlighted information:

```markdown
::: {.callout-note}
## 📅 Dates and Location
20–21 May 2026 | Basel, Switzerland
:::

::: {.callout-important}
## ⚠️ Registration deadline
15 March 2026
:::
```

Common callout types: `callout-note`, `callout-tip`, `callout-warning`, `callout-important`, `callout-caution`.

## Buttons / CTAs

Use the `.btn` class on links for call-to-action buttons:

```markdown
[Register here](https://example.com/register){.btn}
```

## Images

Reference images relative to the repository root using forward slashes:

```markdown
![Alt text](Materials/Logos/PalaeOpen_without_text.png)
```

Verify the image path exists in the repository before writing it.

## Tables

Use standard Markdown pipe tables. Align columns where helpful:

```markdown
| Name | Affiliation | Role |
|------|-------------|------|
| Jane Smith | Univ. of X | Speaker |
```

## Code in `.qmd` Files

- R code chunks that generate badge/color outputs are allowed (see `prague_2025.qmd` for the pattern); keep them at the top of the file.
- Do not add unnecessary R chunks to simple content pages.

## Line Length

There is no hard line length limit for prose in instruction or content files.
YAML values should not be wrapped if wrapping would harm readability.

## Do Not

- Do not hard-code `categories:` in event files — `R/_categorize_events.R` sets it.
- Do not edit `events/events.qmd` by hand — it is auto-generated.
- Do not duplicate the page title in both the `title:` frontmatter and as a `#` heading — Quarto renders the `title:` field as the page heading automatically.
