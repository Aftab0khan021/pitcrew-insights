import Resolver from '@forge/resolver';
import api from '@forge/api';

const resolver = new Resolver();

resolver.define('getIssue', async ({ context }) => {
  const issueKey = context.extension.issue.key;
  const response = await api.asApp().requestJira(`/rest/api/3/issue/${issueKey}`);
  return await response.json();
});

export const handler = resolver.getDefinitions();
