import Resolver from '@forge/resolver';
import api from '@forge/api';

const resolver = new Resolver();

resolver.define('getIssueData', async ({ context }) => {
  const issueKey = context.extension.issue.key;

  const response = await api
    .asApp()
    .requestJira(`/rest/api/3/issue/${issueKey}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch issue ${issueKey}`);
  }

  const data = await response.json();

  return {
    key: data.key,
    summary: data.fields.summary,
    status: data.fields.status.name,
    reporter: data.fields.reporter.displayName
  };
});

export const handler = resolver.getDefinitions();
