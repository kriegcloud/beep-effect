# P3 Discovery Report - Agent 3

## Scope
- `apps/todox/src/app/lexical/plugins/N*-Z*`
- PageBreakPlugin through YouTubePlugin (alphabetically)

## Files with Set Usage

### 1. TableActionMenuPlugin/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/TableActionMenuPlugin/index.tsx`

- **Line 313**: `const rowCells = new Set<TableCellNode>();`
  - Type: `Set<TableCellNode>`
  - **Mutation Type**: Mutable (uses add/has for deduplication)
  - **Operations**:
    - Line 324: `!rowCells.has(mapCell.cell)` - checking if cell exists
    - Line 325: `rowCells.add(mapCell.cell)` - adding cell to set

- **Line 342**: `const columnCells = new Set<TableCellNode>();`
  - Type: `Set<TableCellNode>`
  - **Mutation Type**: Mutable (uses add/has for deduplication)
  - **Operations**:
    - Line 352: `!columnCells.has(mapCell.cell)` - checking if cell exists
    - Line 353: `columnCells.add(mapCell.cell)` - adding cell to set

### 2. TableCellResizer/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/TableCellResizer/index.tsx`

- **Line 67**: `const tableKeys = new Set<NodeKey>();`
  - Type: `Set<NodeKey>`
  - **Mutation Type**: Mutable (uses add/delete/size for tracking)
  - **Operations**:
    - Line 72: `tableKeys.delete(nodeKey)` - removing destroyed table keys
    - Line 74: `tableKeys.add(nodeKey)` - adding created/updated table keys
    - Line 77: `setHasTable(tableKeys.size > 0)` - checking if set is non-empty

### 3. TableHoverActionsPlugin/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/TableHoverActionsPlugin/index.tsx`

- **Line 37**: `const tableSetRef = useRef<Set<NodeKey>>(new Set());`
  - Type: `Set<NodeKey>`
  - **Mutation Type**: Mutable (uses add/delete/iteration/size)
  - **Operations**:
    - Line 177: `tableSetRef.current.add(key)` - adding newly created table keys
    - Line 182: `tableSetRef.current.delete(key)` - removing destroyed table keys
    - Line 193: `for (const tableKey of tableSetRef.current)` - iterating over set
    - Line 197: `setShouldListenMouseMove(tableSetRef.current.size > 0)` - checking if non-empty

### 4. TestRecorderPlugin/index.tsx

**File Path**: `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx`

- **Line 116**: `const keyPresses = new Set([...])`
  - Type: `Set<string>` (keyboard keys)
  - **Mutation Type**: Immutable (only uses `.has()` for checking)
  - **Operations**:
    - Line 224: `keyPresses.has(key)` - checking if key is in set
    - Line 238: `!keyPresses.has(key)` - checking if key is NOT in set

### 5. TypingPerfPlugin/index.ts

**File Path**: `apps/todox/src/app/lexical/plugins/TypingPerfPlugin/index.ts`

- **Line 9**: `const validInputTypes = new Set([...])`
  - Type: `Set<string>` (input event types)
  - **Mutation Type**: Immutable (only uses `.has()` for validation)
  - **Operations**:
    - Line 72: `!validInputTypes.has(event.inputType)` - checking if input type is valid

## Summary

| Metric | Count |
|--------|-------|
| **Total files with Set usage** | 5 |
| **Total Set instances** | 6 |
| **Mutable Sets** | 4 |
| **Immutable Sets** | 2 |
