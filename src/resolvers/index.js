import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('getIssueData', async ({ context }) => {
  const issueKey = context.extension.issue.key;

  const response = await api.asApp().requestJira(
    route`/rest/api/3/issue/${issueKey}`
  );

  const issue = await response.json();

  return {
    key: issue.key,
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    reporter: issue.fields.reporter.displayName
  };
});

export const handler = resolver.getDefinitions();
