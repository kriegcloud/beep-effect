---
description: {{agentDescription}}
tools: [{{toolsList}}]
---

# {{agentName}} Agent

{{agentPurpose}}

## MCP Server Prerequisites

Before using {{mcpTools}}, ensure the MCP server is available.

### Enable via Docker MCP

If `{{mcpToolCheck}}` fails with "tool not found":

```
1. mcp__MCP_DOCKER__mcp-find({ query: "{{mcpQuery}}" })
2. mcp__MCP_DOCKER__mcp-add({ name: "{{mcpName}}", activate: true })
```

### Fallback Strategy

If MCP cannot be enabled, use local sources:
{{fallbackStrategy}}

---

## Critical Constraints

1. **{{constraint1}}**
2. **{{constraint2}}**
3. **{{constraint3}}**

## Required Imports

```typescript
{{requiredImports}}
```

---

## {{section1Name}}

{{section1Content}}

---

## {{section2Name}}

{{section2Content}}

---

## Methodology

### Step 1: {{step1Name}}
{{step1Description}}

### Step 2: {{step2Name}}
{{step2Description}}

### Step 3: {{step3Name}}
{{step3Description}}

### Step 4: {{step4Name}}
{{step4Description}}

---

## Before/After Example

### Before
```typescript
{{beforeCode}}
```

### After
```typescript
{{afterCode}}
```

---

## Verification Checklist

- [ ] {{verificationItem1}}
- [ ] {{verificationItem2}}
- [ ] {{verificationItem3}}
- [ ] {{verificationItem4}}
