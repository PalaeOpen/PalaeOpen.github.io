---
description: "Use when rendering the PalaeOpen Quarto website, committing the docs/ output, or troubleshooting render failures. Covers the render command, pre-render hook, docs/ commit requirement, and known environment considerations."
---

# Rendering Quarto and Committing `docs/` — PalaeOpen

## Render Command

Run from the **repository root**:

```bash
quarto render
```

Do **not** render individual files (e.g., `quarto render events/2026/foo.qmd`) — always render the full site so that `events/events.qmd` and all cross-references stay consistent.

## What Happens During Render

1. **Pre-render hook** — `R/_categorize_events.R` runs automatically (configured in `_quarto.yml`). It:
   - Compares each event's `event-date` / `event-end-date` to the current date
   - Writes `categories: Future` or `categories: Past` into each event `.qmd`
   - Regenerates `events/events.qmd` with the correct file listings
2. All `.qmd` files are compiled to HTML.
3. Output is written to `docs/`.

## Do Not

- Do **not** run `R/_categorize_events.R` manually — it will run as part of `quarto render`.
- Do **not** edit `events/events.qmd` by hand — it is overwritten every render.
- Do **not** commit to `main` — all changes go on a feature branch.

## Committing `docs/`

After a successful render, commit **both** the source changes and the `docs/` output together on the same feature branch:

```bash
git add .
git commit -m "Add/update [description]; render docs"
```

The `docs/` folder is **not** in `.gitignore` — it must be committed.
GitHub Pages serves the site directly from `docs/` on the `main` branch.

## Required Tools

| Tool | Version | Source |
|------|---------|--------|
| [Quarto](https://quarto.org/docs/get-started/) | latest stable | <https://quarto.org/docs/get-started/> |
| R | **4.5.1** (from `renv.lock`) | via `rig` (see below) |
| `{renv}` | latest | installed after R is ready |
| R packages | as locked in `renv.lock` | restored via `renv::restore()` |

The **exact R version** required is declared in `renv.lock` under `"R": { "Version": "4.5.1" }`.
Always use this version — do not use a different R version, as package binaries are locked to it.

## Environment Setup (Copilot Coding Agent Sandbox)

The GitHub Copilot Coding Agent runs in a sandboxed Linux environment.
R, Quarto, and project packages are **not pre-installed**.
Follow these steps in order before running `quarto render`.

### Step 1 — Install Quarto

```bash
# Download and install the latest Quarto release
wget -q https://quarto.org/download/latest/quarto-linux-amd64.deb
sudo dpkg -i quarto-linux-amd64.deb
quarto --version   # verify
```

If `wget` or `dpkg` are unavailable, use the tarball installer:

```bash
curl -LO https://github.com/quarto-dev/quarto-cli/releases/latest/download/quarto-linux-amd64.tar.gz
tar -xzf quarto-linux-amd64.tar.gz
sudo cp quarto-linux-amd64/bin/quarto /usr/local/bin/
quarto --version   # verify
```

### Step 2 — Install R 4.5.1 via `rig`

[`rig`](https://github.com/r-lib/rig) is the R Installation Manager.
It installs and manages multiple R versions cleanly.

```bash
# Install rig
curl -Ls https://github.com/r-lib/rig/releases/latest/download/rig-linux-amd64.tar.gz | sudo tar xz -C /usr/local

# Install the exact R version declared in renv.lock
rig install 4.5.1
rig default 4.5.1

R --version   # verify — should show R 4.5.1
```

### Step 3 — Install `{renv}` and Restore Packages

`{renv}` manages all R package dependencies.
The `renv.lock` file pins every package to the exact version used when the site was last rendered.

```bash
# From the repository root:
Rscript -e "install.packages('renv', repos = 'https://cloud.r-project.org')"
Rscript -e "renv::restore()"
```

`renv::restore()` will install all packages listed in `renv.lock` into the project-local library.
This may take several minutes on first run.
If it asks for confirmation, pass `prompt = FALSE`:

```bash
Rscript -e "renv::restore(prompt = FALSE)"
```

### Step 4 — Render the Site

Once R, Quarto, and all packages are in place, render from the **repository root**:

```bash
quarto render
```

Verify success:
- Exit code must be `0`.
- `docs/index.html` should have an updated modification timestamp.
- The HTML file for the changed page must exist under `docs/`.

### Step 5 — Commit `docs/`

```bash
git add .
git commit -m "Add/update [description]; render docs"
```

## Fallback: If the Environment Cannot Be Set Up

If any installation step fails and cannot be resolved:

1. Commit the source `.qmd` changes **without** the `docs/` output.
2. Add a clearly visible note in the PR description:

   ```
   ⚠️ **Render not completed** — [reason: e.g., rig installation failed / renv::restore() error].
   Please run `quarto render` locally and push the `docs/` output before merging.
   ```

3. Tag `@OndrejMottl` in the PR so they can render locally before merging.
4. Do **not** merge the PR — rendering must be completed first.

## Verifying the Render

After rendering, confirm:

- `docs/index.html` is updated (check modification timestamp).
- The changed page's HTML file exists under `docs/` at the expected path.
- No Quarto error output appeared (exit code 0).
