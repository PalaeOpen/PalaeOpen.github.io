// Assigns an issue to the GitHub Copilot coding agent.
//
// Used by:
//   - copilot-readiness-check.yml (automatic, after the issue passes the readiness check)
//   - copilot-assign.yml (manual maintainer override, `force: true`)
//
// The `github` client must be authenticated with COPILOT_TRIGGER_PAT: the
// built-in GITHUB_TOKEN cannot assign Copilot.

const READY_LABEL = '🤖 ready-for-copilot';
const NEEDS_INFO_LABEL = '❓ status:needs-info';
const NO_AGENT_LABEL = '⏸️ no-agent';
const COPILOT_LOGINS = ['copilot', 'copilot-swe-agent', 'copilot-swe-agent[bot]'];

const CUSTOM_INSTRUCTIONS = [
  'Implement the issue now; do not stop after writing a plan.',
  'Read all instructions in .github/ first, especially .github/agents/website-maintainer.agent.md.',
  'Work on the branch and draft PR provisioned by Copilot. Do not manually create a branch, commit, push, or open another PR.',
  'Change source files only: do not render the site and do not change docs/ (it is rebuilt automatically after merge).',
  'Before finishing an implementation, verify that git status shows the intended changes and include <!-- copilot-implementation-attempted --> in the final PR summary.',
].join(' ');

function labelNames(issue) {
  return (issue.labels || []).map((label) => (typeof label === 'string' ? label : label.name));
}

function isCopilotAssigned(issue) {
  return (issue.assignees || []).some((assignee) =>
    COPILOT_LOGINS.includes((assignee.login || '').toLowerCase())
  );
}

async function assignCopilot({ github, context, core, issueNumber, force = false }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  // Re-fetch: the event payload may be stale by the time this runs.
  const { data: issue } = await github.rest.issues.get({ owner, repo, issue_number: issueNumber });

  if (issue.state !== 'open') {
    core.notice(`Issue #${issueNumber} is ${issue.state}; skipping Copilot assignment.`);
    return 'skipped';
  }

  if (isCopilotAssigned(issue)) {
    core.notice(`Copilot is already assigned to issue #${issueNumber}; skipping.`);
    return 'skipped';
  }

  if (!force) {
    const labels = labelNames(issue);
    if (
      !labels.includes(READY_LABEL) ||
      labels.includes(NEEDS_INFO_LABEL) ||
      labels.includes(NO_AGENT_LABEL)
    ) {
      core.notice(`Issue #${issueNumber} labels are no longer in a ready state; skipping Copilot assignment.`);
      return 'skipped';
    }
  }

  const response = await github.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', {
    owner,
    repo,
    issue_number: issueNumber,
    assignees: ['copilot-swe-agent[bot]'],
    agent_assignment: {
      target_repo: `${owner}/${repo}`,
      base_branch: 'main',
      custom_agent: 'website-maintainer',
      custom_instructions: CUSTOM_INSTRUCTIONS,
      model: '',
    },
    headers: {
      accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!isCopilotAssigned(response.data)) {
    throw new Error(`GitHub accepted the request but did not assign Copilot to issue #${issueNumber}.`);
  }

  core.notice(`Assigned issue #${issueNumber} to the Copilot coding agent.`);
  return 'assigned';
}

module.exports = assignCopilot;
module.exports.isCopilotAssigned = isCopilotAssigned;
