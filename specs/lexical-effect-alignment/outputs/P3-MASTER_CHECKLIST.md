# P3 Master Checklist: Native Set → Effect HashSet/MutableHashSet

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total files with native Set** | 7 |
| **Total Set instances** | 9 |
| **Mutable Sets (→ MutableHashSet)** | 7 |
| **Immutable Sets (→ HashSet)** | 2 |

---

## Migration Checklist

### Mutable Sets (→ MutableHashSet)

These Sets use mutation operations (`.add()`, `.delete()`, `.clear()`) and must be converted to `MutableHashSet`.

#### 1. CodeActionMenuPlugin/index.tsx

- [ ] **Line 32**: `const codeSetRef = useRef<Set<string>>(new Set());`
  - **Variable**: `codeSetRef`
  - **Operations**: `.add()` (L102), `.delete()` (L106), `.size` (L114)
  - **Migration Pattern**:
    ```typescript
    // Before
    const codeSetRef = useRef<Set<string>>(new Set());
    codeSetRef.current.add(key);
    codeSetRef.current.delete(key);
    codeSetRef.current.size > 0

    // After
    import * as MutableHashSet from "effect/MutableHashSet";
    const codeSetRef = useRef(MutableHashSet.make<string>());
    MutableHashSet.add(codeSetRef.current, key);
    MutableHashSet.remove(codeSetRef.current, key);
    MutableHashSet.size(codeSetRef.current) > 0
    ```

#### 2. CommentPlugin/index.tsx

- [ ] **Line 640**: `const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => { return new Map(); }, []);`
  - **Variable**: `markNodeMap` (Map with Set values)
  - **Note**: Map contains Set values; update type signature

- [ ] **Line 803**: `markNodeKeys = new Set();`
  - **Variable**: `markNodeKeys`
  - **Operations**: `.add()` (L807), `.delete()` (L796), `.has()` (L806), `.size` (L797)
  - **Migration Pattern**:
    ```typescript
    // Before
    markNodeKeys = new Set();
    markNodeKeys.add(key);
    markNodeKeys.delete(key);
    markNodeKeys.has(key);
    markNodeKeys.size === 0

    // After
    import * as MutableHashSet from "effect/MutableHashSet";
    markNodeKeys = MutableHashSet.make<NodeKey>();
    MutableHashSet.add(markNodeKeys, key);
    MutableHashSet.remove(markNodeKeys, key);
    MutableHashSet.has(markNodeKeys, key);
    MutableHashSet.size(markNodeKeys) === 0
    ```

#### 3. TableActionMenuPlugin/index.tsx

- [ ] **Line 313**: `const rowCells = new Set<TableCellNode>();`
  - **Variable**: `rowCells`
  - **Operations**: `.add()` (L325), `.has()` (L324)
  - **Migration Pattern**:
    ```typescript
    // Before
    const rowCells = new Set<TableCellNode>();
    rowCells.has(mapCell.cell);
    rowCells.add(mapCell.cell);

    // After
    import * as MutableHashSet from "effect/MutableHashSet";
    const rowCells = MutableHashSet.make<TableCellNode>();
    MutableHashSet.has(rowCells, mapCell.cell);
    MutableHashSet.add(rowCells, mapCell.cell);
    ```

- [ ] **Line 342**: `const columnCells = new Set<TableCellNode>();`
  - **Variable**: `columnCells`
  - **Operations**: `.add()` (L353), `.has()` (L352)
  - **Migration Pattern**: Same as rowCells

#### 4. TableCellResizer/index.tsx

- [ ] **Line 67**: `const tableKeys = new Set<NodeKey>();`
  - **Variable**: `tableKeys`
  - **Operations**: `.add()` (L74), `.delete()` (L72), `.size` (L77)
  - **Migration Pattern**:
    ```typescript
    // Before
    const tableKeys = new Set<NodeKey>();
    tableKeys.add(nodeKey);
    tableKeys.delete(nodeKey);
    tableKeys.size > 0

    // After
    import * as MutableHashSet from "effect/MutableHashSet";
    const tableKeys = MutableHashSet.make<NodeKey>();
    MutableHashSet.add(tableKeys, nodeKey);
    MutableHashSet.remove(tableKeys, nodeKey);
    MutableHashSet.size(tableKeys) > 0
    ```

#### 5. TableHoverActionsPlugin/index.tsx

- [ ] **Line 37**: `const tableSetRef = useRef<Set<NodeKey>>(new Set());`
  - **Variable**: `tableSetRef`
  - **Operations**: `.add()` (L177), `.delete()` (L182), iteration (L193), `.size` (L197)
  - **Migration Pattern**:
    ```typescript
    // Before
    const tableSetRef = useRef<Set<NodeKey>>(new Set());
    tableSetRef.current.add(key);
    tableSetRef.current.delete(key);
    for (const tableKey of tableSetRef.current) { ... }
    tableSetRef.current.size > 0

    // After
    import * as MutableHashSet from "effect/MutableHashSet";
    const tableSetRef = useRef(MutableHashSet.make<NodeKey>());
    MutableHashSet.add(tableSetRef.current, key);
    MutableHashSet.remove(tableSetRef.current, key);
    for (const tableKey of MutableHashSet.values(tableSetRef.current)) { ... }
    MutableHashSet.size(tableSetRef.current) > 0
    ```

---

### Immutable Sets (→ HashSet)

These Sets are read-only constants (only use `.has()`) and should be converted to `HashSet`.

#### 6. TestRecorderPlugin/index.tsx

- [ ] **Line 116**: `const keyPresses = new Set([...])`
  - **Variable**: `keyPresses`
  - **Operations**: `.has()` (L224, L238)
  - **Migration Pattern**:
    ```typescript
    // Before
    const keyPresses = new Set([
      "Enter", "Backspace", "Delete", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
    ]);
    keyPresses.has(key);

    // After
    import * as HashSet from "effect/HashSet";
    const keyPresses = HashSet.make(
      "Enter", "Backspace", "Delete", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
    );
    HashSet.has(keyPresses, key);
    ```

#### 7. TypingPerfPlugin/index.ts

- [ ] **Line 9**: `const validInputTypes = new Set([...])`
  - **Variable**: `validInputTypes`
  - **Operations**: `.has()` (L72)
  - **Migration Pattern**:
    ```typescript
    // Before
    const validInputTypes = new Set([
      "insertText", "insertFromPaste", ...
    ]);
    validInputTypes.has(event.inputType);

    // After
    import * as HashSet from "effect/HashSet";
    const validInputTypes = HashSet.make(
      "insertText", "insertFromPaste", ...
    );
    HashSet.has(validInputTypes, event.inputType);
    ```

---

## Effect API Quick Reference

### MutableHashSet (for mutable sets)

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

// Create
const set = MutableHashSet.make<string>();

// Add (mutates in place)
MutableHashSet.add(set, "value");

// Remove (mutates in place)
MutableHashSet.remove(set, "value");

// Check membership
MutableHashSet.has(set, "value");  // Returns boolean

// Size is a FUNCTION
MutableHashSet.size(set);  // NOT set.size

// Iteration
for (const item of MutableHashSet.values(set)) { ... }
// OR convert to array
Array.from(MutableHashSet.values(set));
```

### HashSet (for immutable sets)

```typescript
import * as HashSet from "effect/HashSet";

// Create
const set = HashSet.make("a", "b", "c");

// Check membership
HashSet.has(set, "a");  // Returns boolean

// Convert to array
HashSet.toArray(set);
```

---

## Execution Order

Execute in this order (grouped by file for efficiency):

### Batch 1 (5 files)
1. CodeActionMenuPlugin/index.tsx
2. CommentPlugin/index.tsx
3. TableActionMenuPlugin/index.tsx
4. TableCellResizer/index.tsx
5. TableHoverActionsPlugin/index.tsx

### Batch 2 (2 files)
6. TestRecorderPlugin/index.tsx
7. TypingPerfPlugin/index.ts

---

## Verification Commands

After migration:

```bash
# Type check
bun run check --filter=./apps/todox

# Build
bun run build

# Full check
bun run check

# Lint fix + lint
bun run lint:fix
bun run lint
```
