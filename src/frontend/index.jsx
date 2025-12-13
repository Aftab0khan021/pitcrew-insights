import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { Text, Stack } from '@forge/react';

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    invoke('getIssueData')
      .then(setData)
      .catch(() => setError('Failed to load issue data'));
  }, []);

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!data) {
    return <Text>Loading issue data…</Text>;
  }

  return (
    <Stack space="space.100">
      <Text>Issue Key: {data.key}</Text>
      <Text>Summary: {data.summary}</Text>
      <Text>Status: {data.status}</Text>
      <Text>Reporter: {data.reporter}</Text>
    </Stack>
  );
};

export default App;
