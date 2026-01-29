# P3 Discovery Report - Agent 1

## Scope
- `apps/todox/src/app/lexical/nodes/`
- `apps/todox/src/app/lexical/plugins/A*-F*`

## Files with Set Usage

### 1. CodeActionMenuPlugin/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/CodeActionMenuPlugin/index.tsx`

- **Line 32**: `const codeSetRef = useRef<Set<string>>(new Set());`
  - Type: `Set<string>`
  - Initial: Empty Set
  - **Mutation Type**: Mutable (uses `.add()` and `.delete()`)
  - **Operations**:
    - Line 102: `codeSetRef.current.add(key)` - adds key when code node is created
    - Line 106: `codeSetRef.current.delete(key)` - deletes key when code node is destroyed
    - Line 114: `codeSetRef.current.size > 0` - checks size to control mouse move listener state

### 2. CommentPlugin/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx`

- **Line 640**: `const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => { return new Map(); }, []);`
  - Type: `Map<string, Set<NodeKey>>` (Map containing Set instances)
  - **Note**: Map declaration with Set values

- **Line 803**: `markNodeKeys = new Set();`
  - Type: `Set<NodeKey>` (inferred)
  - **Mutation Type**: Mutable
  - **Operations**:
    - Line 806: `!markNodeKeys.has(key)` - checks if key exists
    - Line 807: `markNodeKeys.add(key)` - adds key to set
    - Line 796: `markNodeKeys.delete(key)` - deletes key from set
    - Line 797: `markNodeKeys.size === 0` - checks if set is empty

### Nodes Directory

**No Set usage found** in `apps/todox/src/app/lexical/nodes/`

## Summary

| Metric | Count |
|--------|-------|
| **Total files with Set usage** | 2 |
| **Total Set instances** | 3 |
| **Mutable Sets** | 3 |
| **Immutable Sets** | 0 |
