# {{skillName}} Skill

## When to Invoke

Invoke this skill when:
- {{invocationCondition1}}
- {{invocationCondition2}}
- {{invocationCondition3}}

## MCP Server Prerequisites

Before using {{mcpToolName}}, ensure the MCP server is available.

### Enable via Docker MCP

```
1. mcp__MCP_DOCKER__mcp-find({ query: "{{mcpServerQuery}}" })
2. mcp__MCP_DOCKER__mcp-add({ name: "{{mcpServerName}}", activate: true })
```

### Fallback Strategy

If MCP cannot be enabled, use local sources:
- {{fallbackSource1}}
- {{fallbackSource2}}

---

## Critical Constraints

1. **{{constraint1Name}}** — {{constraint1Description}}
2. **{{constraint2Name}}** — {{constraint2Description}}
3. **{{constraint3Name}}** — {{constraint3Description}}

---

## Workflow

### Step 1: Parse Requirements

Extract from user request:
- Component name
- Props/interface requirements
- Styling requirements
- Integration points

### Step 2: Query Documentation

```
{{mcpDocLookupExample}}
```

### Step 3: Check Existing Patterns

Search codebase for similar implementations:
```
Glob: {{codebaseSearchPattern}}
```

### Step 4: Generate Component

Follow the output template below.

### Step 5: Integrate

- Add exports to index file
- Update documentation if needed

---

## Output Template

```typescript
{{outputCodeTemplate}}
```

---

## Example Invocations

### Example 1: {{example1Title}}

**User request**: "{{example1Request}}"

**Actions**:
1. {{example1Action1}}
2. {{example1Action2}}
3. {{example1Action3}}

### Example 2: {{example2Title}}

**User request**: "{{example2Request}}"

**Actions**:
1. {{example2Action1}}
2. {{example2Action2}}

---

## Verification Checklist

- [ ] Component compiles without errors
- [ ] Follows codebase naming conventions
- [ ] Uses theme tokens (no hardcoded values)
- [ ] Includes TypeScript types
- [ ] Exports added to index
