---
description: 'Create API endpoint documentation'
name: 'document-api'
agent: 'ask'
---

Document the API endpoint: ${input:endpoint:Enter endpoint path (e.g., /api/users)}

Include:
- HTTP method: ${input:method:GET, POST, PUT, DELETE}
- Request parameters
- Response format
- Example usage
- Error codes

Current file context: ${file}
