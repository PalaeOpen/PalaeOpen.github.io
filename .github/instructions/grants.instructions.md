---
description: "Use when creating or updating grant and STSM (Short-Term Scientific Mission) call pages, or blog posts from funded activities, for the PalaeOpen website."
applyTo: "grants/**/*.qmd"
---

# Grant and STSM Pages — PalaeOpen

## File Path Convention

```
grants/stms/stms_YYYY.qmd                  # main annual STSM call
grants/stms/stms_YYYY_NNcall.qmd           # numbered subsequent calls
grants/stms/stms_blog_posts.qmd            # index of blog posts
grants/stms/blogs/author_city_YYYY.qmd     # individual blog posts
```

Examples:
- `grants/stms/stms_2026.qmd`
- `grants/stms/stms_2026_3rdcall.qmd`
- `grants/stms/blogs/smith_vienna_2026.qmd`

Use `snake_case`, no spaces.

## Required Frontmatter

```yaml
---
date: YYYY/MM/DD            # creation or last significant update date
date-format: long
date-modified: last-modified
sidebar: false
---
```

For blog posts from funded STSM activities, also include:

```yaml
---
date: YYYY/MM/DD
date-format: long
date-modified: last-modified
author: "First Last"
description: "One-sentence summary for the blog listing."
sidebar: false
---
```

## Page Title

Use `title:` in the frontmatter for grant/STSM call pages:

```yaml
title: "Open Call for STSM Grants — PalaeOpen 2026 (3rd Call)"
```

## Standard Content Sections (STSM Call Page)

Follow this order:

1. **Introduction / What is an STSM** — Brief explanation for new applicants
2. **Eligibility and Scope** — Who can apply, what activities are covered
3. **Financial Support** — Grant amounts, what is covered
4. **Key Dates** — Opens, submission deadline, decision date, activity window
5. **Application Process** — Step-by-step with numbered list and links
6. **Contact** — Who to contact for questions
7. **Previous Grantees** (optional) — Link to blog posts or list

## Key Dates Callout

Always present key dates in a callout box:

```markdown
::: {.callout-important}
## 📅 Key Dates
- **Opens:** 1 March 2026
- **Submission deadline:** 30 April 2026
- **Decision date:** 15 May 2026
- **Activity window:** June 2026 – October 2026
:::
```

## Application Button

Link the application form with a prominent button:

```markdown
[Apply via e-COST](https://e-services.cost.eu/action/CA23116){.btn}
```

## STSM Blog Post Pages

Individual reports from STSM grantees follow this structure:

```markdown
---
date: YYYY/MM/DD
date-format: long
date-modified: last-modified
author: "First Last"
description: "Brief summary of the STSM experience."
sidebar: false
---

## [Title of the Report / Experience]

**Host institution:** [Name], [City], [Country]
**Dates:** [Start] – [End]

[Body: narrative of the visit, scientific outcomes, acknowledgements]

---
*This STSM was funded by the COST Action CA23116 — PalaeOpen.*
```

## Status Labels

When a call is closed, add a callout at the top:

```markdown
::: {.callout-warning}
## This call is now closed
Applications for this round are no longer accepted.
:::
```

## Updating an Existing Call Page

When instructed to update (e.g., extend deadline, add results):

- Keep the original content intact; add/replace only the changed fields.
- Update `date-modified: last-modified` is handled automatically by Quarto.
- If deadline changes, update both the callout dates and any inline text that references the date.
