#!/usr/bin/env Rscript

if (!require("yaml")) install.packages("yaml")
if (!require("purrr")) install.packages("purrr")
if (!require("stringr")) install.packages("stringr")

library(yaml)
library(purrr)
library(stringr)

event_files <-
  list.files(
    path = "events",
    pattern = "\\.qmd$",
    recursive = TRUE,
    full.names = TRUE
  )

cat("Categorizing", length(event_files), "event files...\n")

categorize_event <- function(event_file) {
  file_content <-
    readLines(event_file, warn = FALSE)

  yaml_delimiters <-
    which(file_content == "---")

  if (length(yaml_delimiters) < 2) {
    cat("Warning: No valid YAML frontmatter in", event_file, "\n")
    return(NULL)
  }

  yaml_start <- yaml_delimiters[1] + 1
  yaml_end <- yaml_delimiters[2] - 1

  yaml_text <-
    file_content[yaml_start:yaml_end] |>
    paste(collapse = "\n")

  frontmatter <-
    tryCatch(
      yaml::yaml.load(yaml_text),
      error = function(e) {
        cat("Warning: Failed to parse YAML in", event_file, ":", e$message, "\n")
        return(NULL)
      }
    )

  if (is.null(frontmatter) || is.null(frontmatter$`event-date`)) {
    if (!is.null(frontmatter)) {
      cat("Warning: No event-date field in", event_file, ", skipping\n")
    }
    return(NULL)
  }

  categorization_date <-
    frontmatter$`event-end-date` %||% frontmatter$`event-date`

  event_date <-
    tryCatch(
      as.Date(categorization_date, format = "%Y/%m/%d"),
      error = function(e) {
        cat("Warning: Invalid date format in", event_file, ":", categorization_date, "\n")
        return(NULL)
      }
    )

  if (is.null(event_date)) {
    return(NULL)
  }

  category <-
    if (event_date >= Sys.Date()) "Future" else "Past"

  frontmatter$categories <- category

  new_yaml <-
    yaml::as.yaml(frontmatter)

  new_content <-
    c(
      "---",
      strsplit(new_yaml, "\n")[[1]],
      "---",
      file_content[(yaml_end + 2):length(file_content)]
    )

  writeLines(new_content, event_file)

  cat("  -", basename(event_file), "->", category, "\n")

  list(
    category = category,
    path = sub("^events/", "", event_file)
  )
}

results <-
  event_files |>
  purrr::map(categorize_event) |>
  purrr::compact()

future_events <-
  results |>
  purrr::keep(~ .x$category == "Future") |>
  purrr::map_chr("path")

past_events <-
  results |>
  purrr::keep(~ .x$category == "Past") |>
  purrr::map_chr("path")

cat("Event categorization complete!\n")
cat("Generating events listing page...\n")

format_yaml_list <- function(files, indent = 6) {
  if (length(files) == 0) {
    return(paste0(strrep(" ", indent), "[]"))
  }
  paste0(strrep(" ", indent), "- \"", files, "\"", collapse = "\n")
}

events_qmd_content <-
  paste0(
    "---\n",
    "title: \"Events\"\n",
    "date: 2025/01/29\n",
    "date-format: long\n",
    "date-modified: last-modified\n",
    "sidebar: false\n",
    "format:\n",
    "  html:\n",
    "    embed-resources: true\n",
    "listing:\n",
    "  - id: \"future\"\n",
    "    max-description-length: 1000\n",
    "    fields: [event-date, title, description]\n",
    "    contents:\n",
    format_yaml_list(future_events), "\n",
    "    sort: \"event-date asc\"\n",
    "    type: grid\n",
    "    grid-columns: 3\n",
    "    grid-item-align: left\n",
    "    grid-item-border: true\n",
    "    categories: false\n",
    "    filter-ui: false\n",
    "    \n",
    "  - id: \"past\"\n",
    "    max-description-length: 1000\n",
    "    fields: [event-date, title, description]\n",
    "    contents:\n",
    format_yaml_list(past_events), "\n",
    "    sort: \"event-date desc\"\n",
    "    type: grid\n",
    "    grid-columns: 3\n",
    "    grid-item-align: left\n",
    "    grid-item-border: true\n",
    "    categories: false\n",
    "    filter-ui: false\n",
    "---\n",
    "\n",
    "# Upcoming Events\n",
    "\n",
    "These are our scheduled future events. Join us to collaborate, learn, and contribute to open paleoecological data!\n",
    "\n",
    "::: {#future}\n",
    ":::\n",
    "\n",
    "# Past Events\n",
    "\n",
    "Explore our previous workshops, training schools, and meetings.\n",
    "\n",
    "::: {#past}\n",
    ":::\n"
  )

writeLines(events_qmd_content, "events/events.qmd")

cat("Events listing page generated successfully!\n")
cat("  - Future events:", length(future_events), "\n")
cat("  - Past events:", length(past_events), "\n")
