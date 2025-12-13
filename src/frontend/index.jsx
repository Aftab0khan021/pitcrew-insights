import ForgeReconciler, { Text, Stack } from '@forge/react'
import { invoke } from '@forge/bridge'
import { useEffect, useState } from 'react'

const App = () => {
  const [issue, setIssue] = useState(null)

  useEffect(() => {
    invoke('getIssue').then(setIssue)
  }, [])

  if (!issue) {
    return <Text>Loading issue data...</Text>
  }

  return (
    <Stack space="space.200">
      <Text><b>Issue Key:</b> {issue.key}</Text>
      <Text><b>Summary:</b> {issue.fields.summary}</Text>
      <Text><b>Status:</b> {issue.fields.status.name}</Text>
      <Text><b>Reporter:</b> {issue.fields.reporter.displayName}</Text>
    </Stack>
  )
}

ForgeReconciler.render(<App />)
