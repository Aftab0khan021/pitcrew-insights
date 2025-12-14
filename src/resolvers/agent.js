import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

function calculateTelemetry(issue) {
  const histories = issue.changelog?.histories || [];
  histories.sort((a, b) => new Date(a.created) - new Date(b.created));

  const timeInStatus = {};
  let currentStatus = 'Initial'; 
  let lastTime = new Date(issue.fields.created).getTime();

  const firstChange = histories.find(h => h.items.some(i => i.field === 'status'));
  if (firstChange) {
    currentStatus = firstChange.items.find(i => i.field === 'status').fromString;
  }

  for (const history of histories) {
    const item = history.items.find(i => i.field === 'status');
    if (item) {
      const now = new Date(history.created).getTime();
      const hours = (now - lastTime) / (1000 * 60 * 60);
      timeInStatus[currentStatus] = (timeInStatus[currentStatus] || 0) + hours;
      currentStatus = item.toString;
      lastTime = now;
    }
  }
  
  const now = Date.now();
  const hours = (now - lastTime) / (1000 * 60 * 60);
  timeInStatus[currentStatus] = (timeInStatus[currentStatus] || 0) + hours;

  return timeInStatus;
}

resolver.define('fetchIssueTelemetry', async ({ context }) => {
  const issueKey = context.extension.issue?.key || context.extension.context?.issueKey;

  if (!issueKey) {
    return { error: "No issue key found. Run this agent from a Jira Issue context." };
  }

  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${issueKey}?expand=changelog`
  );

  if (!response.ok) {
    return { error: "Could not fetch issue data from the pit wall." };
  }

  const issue = await response.json();
  const telemetry = calculateTelemetry(issue);

  return {
    message: "Telemetry fetched successfully.",
    issueKey: issue.key,
    currentStatus: issue.fields.status.name,
    summary: issue.fields.summary,
    timeInStatusHours: telemetry
  };
});

export const handler = resolver.getDefinitions();