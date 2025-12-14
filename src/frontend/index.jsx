import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import { 
  Text, 
  Stack, 
  Heading, 
  SectionMessage, 
  BarChart, 
  Strong, 
  Em,
  Box 
} from '@forge/react';

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    invoke('getIssueData')
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError('Failed to load pitcrew telemetry');
      });
  }, []);

  if (error) {
    return (
      <SectionMessage appearance="error" title="Telemetry Failure">
        <Text>{error}</Text>
      </SectionMessage>
    );
  }

  if (!data) {
    return <Text>🏎️ Establishing radio connection with the car...</Text>;
  }

  // Pit Stop Logic: Warn if status is Blocked or In Review (example statuses)
  const isPitStop = ['Blocked', 'In Review', 'Waiting'].includes(data.status);

  return (
    <Stack space="space.200">
      <Heading as="h2">🏁 Pitcrew Insights: {data.key}</Heading>
      
      {isPitStop && (
        <SectionMessage appearance="warning" title="Pit Stop Active">
          <Text>
            This car is currently <Strong>{data.status}</Strong>. 
            The crew needs to clear this bottleneck to get back on track!
          </Text>
        </SectionMessage>
      )}

      {!isPitStop && (
        <SectionMessage appearance="success" title="Green Flag">
          <Text>
            Car is <Strong>{data.status}</Strong> and racing down the track.
          </Text>
        </SectionMessage>
      )}

      <Stack space="space.050">
        <Text><Strong>Race Summary:</Strong> {data.summary}</Text>
        <Text><Em>Lead Driver:</Em> {data.reporter}</Text>
      </Stack>

      <Box padding="space.100">
        <Heading as="h3">⏱️ Time in Status (Hours)</Heading>
        {/* Visualizing where the time is going */}
        {data.stats && data.stats.length > 0 ? (
          <BarChart 
            data={data.stats} 
            xAccessor="name" 
            yAccessor="value"
            colorAccessor="name"
          />
        ) : (
          <Text>No telemetry data recorded yet.</Text>
        )}
      </Box>
    </Stack>
  );
};

export default App;