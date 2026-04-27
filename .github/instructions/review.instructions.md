---
description: "Use when reviewing any changes made to the PalaeOpen website — by the agent or locally. Covers the full checklist that the change-reviewer agent applies before a PR is opened: YAML validity, content vs issue requirements, file path existence, instruction compliance, and grammar."
---

# Review Checklist — PalaeOpen

The `change-reviewer` agent (or a human reviewer) must verify every item below before a PR is marked ready for review.
Each item must be reported as **PASS** or **FLAG** with a short explanation.

---

## 1. YAML Frontmatter Validity

- [ ] All `.qmd` files modified have valid YAML frontmatter (between `---` markers).
- [ ] Required fields are present for the file type (see [events.instructions.md](.github/instructions/events.instructions.md) and [grants.instructions.md](.github/instructions/grants.instructions.md)).
- [ ] No tab characters in YAML (use spaces only).
- [ ] No bare colons inside unquoted string values.
- [ ] `date` and `event-date` values follow `YYYY/MM/DD` format.
- [ ] `categories:` field in event files is **not** manually set (it is written by `R/_categorize_events.R` at render time; a manually set value will be overwritten).

## 2. Content Matches Issue Requirements

- [ ] All information requested in the issue has been implemented.
- [ ] Public title matches the `title:` field (or `## Heading`) in the `.qmd` file.
- [ ] Dates, locations, links, and contact details match what the issue specified.
- [ ] No placeholder text remains (e.g., `Add content here`, `TODO`, `TBD`).
- [ ] If the issue specified an existing source file or URL, those match the implemented content.

## 3. File Paths and Links

- [ ] All file paths referenced in `.qmd` files (images, other pages, materials)
  exist in the repository.
- [ ] All external URLs in the content are plausible (correct domain, no obvious typos). Do not open URLs; check structure only.
- [ ] New files are placed at the path specified in the issue (or the convention from the relevant instruction file).
- [ ] `events/events.qmd` has **not** been hand-edited — it is auto-generated.

## 4. Instruction Compliance

- [ ] File naming follows `snake_case` with year suffix for events/grants (e.g., `basel_workshop_2026.qmd`, `stms_2026_3rdcall.qmd`).
- [ ] `docs/` HTML output is committed on the same branch as the source changes.
- [ ] The branch name follows `issue[N]` or `issue[N]-short-description` convention.
- [ ] The PR description contains `- close #[issue number]`.
- [ ] Both @OndrejMottl and @xbenitogranell are assigned as PR reviewers.
- [ ] No merge has been performed by the agent.

## 5. Spelling and Grammar

- [ ] No obvious spelling errors in headings and body text.
- [ ] No obvious grammatical errors that would embarrass the organisation.
- [ ] Scientific terms and proper nouns are capitalised correctly (e.g., *PalaeOpen*, *COST Action*, *CA23116*, *Quarto*).

## 6. Rendered HTML Validation

After `quarto render`, inspect the generated HTML files in `docs/` for the changed pages.

- [ ] The expected HTML file exists at the correct path under `docs/` (e.g., `docs/events/2026/basel_workshop_2026.html`).
- [ ] The HTML file is non-empty and contains readable content (not a blank page or Quarto error output).
- [ ] All `<img>` tags in the rendered HTML have `src` paths that resolve to files that exist under `docs/` or are absolute URLs. Flag any `src` that contains `../` traversal errors or points to a non-existent path.
- [ ] All internal `<a href>` links that point to other pages on `palaeopen.github.io` resolve to HTML files that exist under `docs/`. Flag any `href` that results in a 404.
- [ ] No Quarto error banners appear in the rendered page (e.g., `Error: path not found`, `object not found`).
- [ ] Event pages: the page contains the event date, location, and description visible in the rendered output (not just in frontmatter).
- [ ] The `docs/events/events.html` listing page includes the newly added or updated event.

---

## Reporting Format

Output a table with one row per checklist item:

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Valid YAML frontmatter | PASS | — |
| 2.3 | No placeholder text | FLAG | Line 42 of `events/2026/foo.qmd` still has "TBD" |
| … | … | … | … |

End the report with one of:
- **✅ ALL CHECKS PASSED** — proceed to mark PR ready for review.
- **⚠️ FLAGS FOUND** — fix all flagged items before marking PR ready.
