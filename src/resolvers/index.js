import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

// Helper: Calculate time spent in each status (in hours)
function calculateTimeInStatus(issue) {
  const histories = issue.changelog?.histories || [];
  // Sort histories by date ascending
  histories.sort((a, b) => new Date(a.created) - new Date(b.created));

  const timeInStatus = {};
  let currentStatus = 'Unknown'; // Fallback if we can't determine initial
  
  // Try to find the initial status from history or default to issue status if no history
  // A simplified approach: Assume start time is creation time
  let lastTime = new Date(issue.fields.created).getTime();

  // We need to know the initial status. Usually, it's the 'from' of the first status change.
  // Or we just track changes. For MVP, we'll track known intervals.
  
  // 1. Determine initial status if possible (not always easy via REST without deeper look)
  // For this hackathon, we will assume the first "from" string found is the initial status.
  const firstStatusChange = histories.find(h => h.items.some(i => i.field === 'status'));
  if (firstStatusChange) {
    const changeItem = firstStatusChange.items.find(i => i.field === 'status');
    currentStatus = changeItem.fromString;
  }

  // 2. Iterate through changes
  for (const history of histories) {
    const statusChange = history.items.find(item => item.field === 'status');
    if (statusChange) {
      const currentTime = new Date(history.created).getTime();
      const durationHours = (currentTime - lastTime) / (1000 * 60 * 60);

      if (!timeInStatus[currentStatus]) timeInStatus[currentStatus] = 0;
      timeInStatus[currentStatus] += durationHours;

      // Update state for next lap
      currentStatus = statusChange.toString;
      lastTime = currentTime;
    }
  }

  // 3. Add time from last change until NOW
  const now = new Date().getTime();
  const durationHours = (now - lastTime) / (1000 * 60 * 60);
  if (!timeInStatus[currentStatus]) timeInStatus[currentStatus] = 0;
  timeInStatus[currentStatus] += durationHours;

  // Format for Frontend BarChart: [{ name: 'To Do', value: 12.5 }, ...]
  return Object.keys(timeInStatus).map(status => ({
    name: status,
    value: parseFloat(timeInStatus[status].toFixed(1))
  }));
}

resolver.define('getIssueData', async ({ context }) => {
  const issueKey = context.extension.issue.key;

  // Fetch Issue details + Changelog to see history
  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${issueKey}?expand=changelog`
  );

  if (!response.ok) {
    const err = await response.text();
    console.error(err);
    throw new Error(`Failed to fetch issue: ${response.status}`);
  }

  const issue = await response.json();
  const stats = calculateTimeInStatus(issue);

  return {
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    reporter: issue.fields.reporter.displayName,
    stats: stats
  };
});

export const handler = resolver.getDefinitions();