import { createGraphService } from '@nomik/graph';
import { loadConfigFromEnv } from '@nomik/core';

const config = loadConfigFromEnv();
const graph = createGraphService(config.graph);
await graph.connect();

// Mimic exactly what MCP nm_search does
const KNOWN_LABELS = ['File', 'Function', 'Class', 'Variable', 'Module', 'Route', 'DBTable', 'DBColumn', 'ExternalAPI', 'CronJob', 'Event', 'EnvVar'];
const query = 'parseFiles';
const limit = 10;
const projectId = 'nomik';
const projectFilter = 'AND n.projectId = $projectId';

const results = await graph.executeQuery(
  `MATCH (n)
   WHERE any(lbl IN labels(n) WHERE lbl IN $labels)
     AND (
       $query = '' OR $query = '*'
       OR (n.name IS NOT NULL AND toLower(n.name) CONTAINS toLower($query))
       OR (n.path IS NOT NULL AND toLower(n.path) CONTAINS toLower($query))
       OR (n.id IS NOT NULL AND n.id CONTAINS $query)
     )
     ${projectFilter}
   RETURN n
   ORDER BY CASE WHEN n.name IS NOT NULL THEN n.name ELSE n.path END
   LIMIT toInteger($limit)`,
  { query, limit, labels: KNOWN_LABELS, projectId }
);

console.log('results length:', results.length);
if (results.length > 0) {
  const rec = results[0];
  console.log('record keys:', Object.keys(rec));
  if (rec.n) {
    console.log('n keys:', Object.keys(rec.n));
    console.log('n.properties?', rec.n.properties);
    console.log('n.labels?', rec.n.labels);
    console.log('n.name?', rec.n.name);
    console.log('n.path?', rec.n.path);
  }
} else {
  console.log('EMPTY RESULTS - search is broken');
  // Try simpler query to confirm connectivity
  const simple = await graph.executeQuery('MATCH (n:Function {name: "parseFiles"}) RETURN n.name LIMIT 1', {});
  console.log('simple query result:', simple);
}

await graph.disconnect();
