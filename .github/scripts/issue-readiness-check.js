// Checks whether a PalaeOpen template issue has everything the website agent
// needs, labels it accordingly, and keeps one status comment up to date.
//
// Used by copilot-readiness-check.yml. The field rules mirror Step A2 of
// .github/agents/website-maintainer.agent.md; keep the two in sync when an
// issue template changes.

const READY_LABEL = '🤖 ready-for-copilot';
const NEEDS_INFO_LABEL = '❓ status:needs-info';
const NO_AGENT_LABEL = '⏸️ no-agent';

// Hidden marker that identifies the single status comment this check maintains.
const STATUS_MARKER = '<!-- palaeopen-readiness -->';

const TITLE_PREFIXES = {
  '[New content]:': 'new-content',
  '[Update content]:': 'update-content',
  '[Media]:': 'media',
  '[Event]:': 'event',
  '[Grant call]:': 'grant-call',
  '[Archive/Remove]:': 'archive-remove',
  '[Bug]:': 'bug',
  '[STSM Blog]:': 'stsm-blog',
};

// Fallback when the submitter edited the title prefix away: a field heading
// that only one template has. (Labels are ambiguous: templates 05 and 08 share
// the same labels.)
const SIGNATURE_HEADINGS = {
  'Public title': 'new-content',
  'Exact change request': 'update-content',
  'Asset list': 'media',
  'Event request type': 'event',
  'Call request type': 'grant-call',
  'Requested action': 'archive-remove',
  'Current behavior': 'bug',
  'Blog post title': 'stsm-blog',
};

const TEMPLATE_NAMES = {
  'new-content': 'new content',
  'update-content': 'content update',
  media: 'media',
  event: 'event',
  'grant-call': 'grant call',
  'archive-remove': 'archive/remove',
  bug: 'bug report',
  'stsm-blog': 'STSM blog post',
};

const SITE_URL_RE = /^https?:\/\/(?:www\.)?palaeopen\.github\.io(?:\/|$)/i;
const ANY_URL_RE = /^https?:\/\/\S+$/i;
const YEAR_RE = /\b(?:19|20)\d{2}\b/;
// GitHub writes this for optional fields the submitter left empty.
const NO_RESPONSE = '_No response_';

// Placeholder text of the issue templates (the `value:` defaults in
// .github/ISSUE_TEMPLATE/*.yml). Lines that still match these are ignored
// when deciding whether the submitter wrote anything of their own.
const PLACEHOLDERS = {
  summary: 'Provide a concise summary suitable for website visitors.',
  fullContent: `## Overview

Add the full draft content here.

## Details

- Point 1
- Point 2

## Links

- https://example.org`,
  changeRequest: `### Current
Paste the exact current text/section.

### New
Paste the exact replacement text/section.

### Location in page
Explain where this change appears.`,
  assetList: `- Asset:
  Source:
  Placement:`,
  altText: `- filename.ext: "Accessible alt text or caption"`,
  eventText: `## Event overview

Add event summary.

## Program or agenda

- Item 1
- Item 2

## Registration details

Add registration and eligibility details.`,
  eligibility: `## Eligibility

Describe who can apply.

## Scope

Describe which activities are supported.`,
  keyDates: `- Opens:
- Submission deadline:
- Decision date:
- Activity window:`,
  application: `1. Step one
2. Step two

Links:
- https://...`,
  archiveReason: `Explain why this content should be archived or removed.

Include decision context or governance reference.`,
  currentBehavior: 'Describe exactly what happens now.',
  expectedBehavior: 'Describe what should happen.',
  steps: `1. Open ...
2. Click ...
3. Observe ...`,
  blogContent: `## Who?

State your role (for example, Early Career Researcher), your home institution, and your background.

## Where?

State the host institution, city, and country.

## When?

State your STSM dates.

## Overview

Describe the goal of your STSM and your host institution.

## What I worked on

Describe methods, data, tools, and collaboration.

## Outcomes and next steps

Summarize key outcomes and follow-up plans.

## Acknowledgements

Include collaborators and the required funding sentence.`,
};

function normalize(text) {
  return (text || '').replace(/\r\n/g, '\n').trim();
}

function unwrapCodeFence(text) {
  const value = normalize(text);
  const match = value.match(/^```[^\n]*\n([\s\S]*?)\n?```$/);
  return match ? match[1].trim() : value;
}

function fieldValue(text) {
  const value = unwrapCodeFence(text);
  return value === NO_RESPONSE ? '' : value;
}

function isEmpty(text) {
  return !fieldValue(text);
}

function countChecked(value) {
  return ((value || '').match(/- \[[xX]\]/g) || []).length;
}

// Text the submitter wrote themselves: the field without the template's
// placeholder lines and without blank lines.
function ownText(text, placeholder) {
  const templateLines = new Set(
    normalize(placeholder)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  );
  return fieldValue(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !templateLines.has(line))
    .join('\n');
}

function hasOwnText(text, placeholder, minChars = 1) {
  return ownText(text, placeholder).length >= minChars;
}

function isSiteUrl(text) {
  return SITE_URL_RE.test(fieldValue(text));
}

function parseSections(body) {
  const sections = {};
  const lines = normalize(body).split('\n');
  let currentHeading = null;
  let currentLines = [];
  let inFence = false;

  const commit = () => {
    if (currentHeading) {
      sections[currentHeading] = normalize(currentLines.join('\n'));
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
    }
    if (!inFence && line.startsWith('### ')) {
      commit();
      currentHeading = line.slice(4).trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }
  commit();
  return sections;
}

function getTemplate(issue, sections) {
  const title = normalize(issue.title);
  const fromTitle = Object.entries(TITLE_PREFIXES).find(([prefix]) => title.startsWith(prefix))?.[1];
  if (fromTitle) return fromTitle;
  return Object.entries(SIGNATURE_HEADINGS).find(([heading]) => heading in sections)?.[1] || null;
}

// Small helpers that push a reason when a check fails.
function requireValue(sections, field, reasons) {
  if (isEmpty(sections[field])) {
    reasons.push(`**${field}** is empty.`);
  }
}

function requireOwnText(sections, field, placeholder, reasons, minChars = 1) {
  if (!hasOwnText(sections[field], placeholder, minChars)) {
    reasons.push(`**${field}** is missing or still contains the template's example text.`);
  }
}

function requireSiteUrl(sections, field, reasons) {
  if (!isSiteUrl(sections[field])) {
    reasons.push(`**${field}** must be a link to a page on https://palaeopen.github.io/.`);
  }
}

function requireYear(sections, field, reasons) {
  const value = fieldValue(sections[field]);
  if (!value) {
    reasons.push(`**${field}** is empty.`);
  } else if (!YEAR_RE.test(value)) {
    reasons.push(`**${field}** must include the year (for example 2026-05-10 to 2026-05-12).`);
  }
}

function requireChecked(sections, field, count, reasons) {
  if (countChecked(sections[field]) < count) {
    reasons.push(
      count === 1 ? `**${field}** must be ticked.` : `All ${count} boxes in **${field}** must be ticked.`
    );
  }
}

function validateNewContent(s, reasons) {
  requireValue(s, 'Website area', reasons);
  requireValue(s, 'Public title', reasons);
  requireOwnText(s, 'One-paragraph summary', PLACEHOLDERS.summary, reasons);
  requireOwnText(s, 'Full content draft (Markdown preferred)', PLACEHOLDERS.fullContent, reasons, 30);
  requireChecked(s, 'Content and rights confirmation', 3, reasons);
}

function validateUpdateContent(s, reasons) {
  requireSiteUrl(s, 'Page URL to update', reasons);
  requireValue(s, 'Type of update', reasons);
  requireOwnText(s, 'Exact change request', PLACEHOLDERS.changeRequest, reasons);
  requireChecked(s, 'Confirmation', 1, reasons);
}

function validateMedia(s, reasons) {
  requireValue(s, 'Website area', reasons);
  requireSiteUrl(s, 'Target page URL', reasons);
  requireOwnText(s, 'Asset list', PLACEHOLDERS.assetList, reasons);
  requireOwnText(s, 'Alt text and captions', PLACEHOLDERS.altText, reasons);
  requireValue(s, 'Asset action', reasons);
  requireChecked(s, 'Rights confirmation', 2, reasons);
}

function validateEvent(s, reasons) {
  requireValue(s, 'Event request type', reasons);
  requireValue(s, 'Event name', reasons);
  requireYear(s, 'Event date(s)', reasons);
  requireValue(s, 'Location', reasons);
  requireValue(s, 'Proposed file path', reasons);
  requireOwnText(s, 'Full event text', PLACEHOLDERS.eventText, reasons, 30);
}

function validateGrantCall(s, reasons) {
  requireValue(s, 'Call request type', reasons);
  requireValue(s, 'Call cycle or year', reasons);
  requireValue(s, 'Proposed file path', reasons);
  requireOwnText(s, 'Eligibility and scope', PLACEHOLDERS.eligibility, reasons);
  requireOwnText(s, 'Key dates', PLACEHOLDERS.keyDates, reasons);
  requireOwnText(s, 'Application process and links', PLACEHOLDERS.application, reasons);
  requireChecked(s, 'Confirmation', 1, reasons);
}

function validateArchiveRemove(s, reasons) {
  requireSiteUrl(s, 'Target page URL', reasons);
  requireValue(s, 'Requested action', reasons);
  requireOwnText(s, 'Reason for archive/removal', PLACEHOLDERS.archiveReason, reasons);
  requireValue(s, 'Approval reference', reasons);
  if (/^redirect/i.test(fieldValue(s['Requested action'])) &&
      !ANY_URL_RE.test(fieldValue(s['Redirect URL (if applicable)']))) {
    reasons.push('**Redirect URL (if applicable)** is needed when the requested action is a redirect.');
  }
}

function validateBug(s, reasons) {
  requireSiteUrl(s, 'Affected page URL', reasons);
  requireOwnText(s, 'Current behavior', PLACEHOLDERS.currentBehavior, reasons);
  requireOwnText(s, 'Expected behavior', PLACEHOLDERS.expectedBehavior, reasons);
  requireOwnText(s, 'Steps to reproduce', PLACEHOLDERS.steps, reasons);
  requireValue(s, 'Browser and device', reasons);
}

function validateStsmBlog(s, reasons) {
  requireValue(s, 'Submission format', reasons);
  requireValue(s, 'Author name', reasons);
  requireValue(s, 'Home institution', reasons);
  requireValue(s, 'Host institution', reasons);
  requireYear(s, 'STSM dates', reasons);
  requireValue(s, 'Blog post title', reasons);
  requireOwnText(s, 'Full blog content (Word text is fine)', PLACEHOLDERS.blogContent, reasons, 200);
  requireChecked(s, 'Confirmation', 3, reasons);
}

const VALIDATORS = {
  'new-content': validateNewContent,
  'update-content': validateUpdateContent,
  media: validateMedia,
  event: validateEvent,
  'grant-call': validateGrantCall,
  'archive-remove': validateArchiveRemove,
  bug: validateBug,
  'stsm-blog': validateStsmBlog,
};

function evaluateIssue(issue) {
  const sections = parseSections(issue.body || '');
  const template = getTemplate(issue, sections);
  const reasons = [];

  if (!template) {
    reasons.push('The issue does not use a PalaeOpen issue template.');
    return { ready: false, reasons, template: null };
  }

  VALIDATORS[template](sections, reasons);
  return { ready: reasons.length === 0, reasons, template };
}

async function addLabels(github, issue, labels) {
  if (!labels.length) return;
  await github.rest.issues.addLabels({
    owner: issue.owner,
    repo: issue.repo,
    issue_number: issue.number,
    labels,
  });
}

async function removeLabel(github, issue, label) {
  try {
    await github.rest.issues.removeLabel({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      name: label,
    });
  } catch (error) {
    if (error.status !== 404) throw error;
  }
}

function statusCommentBody(result) {
  const requestName = TEMPLATE_NAMES[result.template] || 'website';
  if (result.ready) {
    return [
      STATUS_MARKER,
      `✅ **Thank you! Your ${requestName} request has everything it needs.**`,
      '',
      'The website assistant (GitHub Copilot) will now start working on it and open a pull request for the website maintainers to review. The pull request will appear on this issue within a few minutes.',
    ].join('\n');
  }
  return [
    STATUS_MARKER,
    `👋 **Thank you for your ${requestName} request!** Before the website assistant can start, please complete the following:`,
    '',
    ...result.reasons.map((reason) => `- ${reason}`),
    '',
    'To do so, edit the issue (click **···** at the top right of the issue text, then **Edit**) and save. This check runs again automatically every time you save.',
    '',
    'If anything is unclear, mention `@OndrejMottl` or `@xbenitogranell` in a comment.',
  ].join('\n');
}

// Keep exactly one status comment per issue and edit it in place, so repeated
// edits do not flood the issue with bot comments.
async function upsertStatusComment(github, issue, body) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner: issue.owner,
    repo: issue.repo,
    issue_number: issue.number,
    per_page: 100,
  });
  const existing = comments.find((comment) => (comment.body || '').startsWith(STATUS_MARKER));

  if (!existing) {
    await github.rest.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body,
    });
    return 'created';
  }
  if (existing.body === body) {
    return 'unchanged';
  }
  await github.rest.issues.updateComment({
    owner: issue.owner,
    repo: issue.repo,
    comment_id: existing.id,
    body,
  });
  return 'updated';
}

async function run({ github, context, core }) {
  const payloadIssue = context.payload.issue;
  const labels = (payloadIssue.labels || []).map((label) => label.name);
  const issue = {
    owner: context.repo.owner,
    repo: context.repo.repo,
    number: payloadIssue.number,
    title: payloadIssue.title || '',
    body: payloadIssue.body || '',
    labels,
  };

  if (payloadIssue.state === 'closed') {
    core.notice('Issue is closed; skipping readiness check.');
    return { ready: false, template: null, optedOut: false, closed: true };
  }

  const result = evaluateIssue(issue);
  const optedOut = labels.includes(NO_AGENT_LABEL);

  core.notice(`Template: ${result.template || 'none'}`);
  if (result.reasons.length) {
    core.notice(`Reasons: ${result.reasons.join(' | ')}`);
  }

  // Maintainers' own issues (no template): no labels, no comment, no Copilot.
  // Use the "Assign issue to Copilot (manual)" workflow for those.
  if (!result.template) {
    core.notice('Not a template issue; leaving it alone.');
    return { ready: false, template: null, optedOut, closed: false };
  }

  if (optedOut) {
    await removeLabel(github, issue, READY_LABEL);
    core.notice('Issue is opted out via ⏸️ no-agent; skipping readiness label updates.');
    return { ready: result.ready, template: result.template, optedOut: true, closed: false };
  }

  if (result.ready) {
    await removeLabel(github, issue, NEEDS_INFO_LABEL);
    await addLabels(github, issue, [READY_LABEL]);
    core.notice('Issue is ready for Copilot.');
  } else {
    await removeLabel(github, issue, READY_LABEL);
    await addLabels(github, issue, [NEEDS_INFO_LABEL]);
    core.notice('Issue is not ready for Copilot.');
  }

  const outcome = await upsertStatusComment(github, issue, statusCommentBody(result));
  core.notice(`Status comment: ${outcome}.`);

  return { ready: result.ready, template: result.template, optedOut: false, closed: false };
}

module.exports = run;
module.exports.evaluateIssue = evaluateIssue;
module.exports.statusCommentBody = statusCommentBody;
module.exports.STATUS_MARKER = STATUS_MARKER;
