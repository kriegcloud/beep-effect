# Sub-Agent Research Prompt: Schema Column Type Derivation Investigation

## Your Task

You are researching a specific Effect Schema type to determine how it can be identified at the type level for SQL column type derivation.

**Schema to investigate: `{SCHEMA_NAME}`**
**Expected column type: `{EXPECTED_COLUMN_TYPE}`**
**Category: `{CATEGORY}`**

## Context

We're building a type-level derivation system (`DeriveColumnTypeFromSchema<Schema>`) that needs to:
1. Take an Effect Schema type parameter
2. Return a literal string type like `"string"`, `"integer"`, `"uuid"`, `"datetime"`, `"json"`, `"bigint"`, `"number"`, `"boolean"`

The challenge is that some schemas share the same encoded TypeScript type but need different column types:
- `S.Int` and `S.Number` both encode to `number`, but should derive `"integer"` and `"number"` respectively
- `S.UUID` and `S.String` both encode to `string`, but should derive `"uuid"` and `"string"` respectively
- `S.Date` and `S.String` both encode to `string`, but should derive `"datetime"` and `"string"` respectively

## Research Instructions

### Step 1: Read the Schema Class Definition

Read the Effect Schema source file to find the class definition for this schema:
- **File**: `tmp/effect/packages/effect/src/Schema.ts`

Look for:
```typescript
export class {SCHEMA_NAME} extends ... { }
```

**IMPORTANT**: You MUST provide:
- The exact line number where the class is defined
- The complete class definition code
- Any related symbols (e.g., `{SCHEMA_NAME}SchemaId`) with their line numbers

Document:
- What class does it extend?
- What parameters are passed to the parent class?
- Are there any unique properties or symbols?
- Is there a `schemaId` annotation?

### Step 2: Examine the AST Structure

Read the Effect SchemaAST source file:
- **File**: `tmp/effect/packages/effect/src/SchemaAST.ts`

**IMPORTANT**: You MUST identify and document:
- The AST node type this schema produces (with line number reference)
- All annotations attached to the schema (list each with property path)
- Any identifiable properties that distinguish it from similar schemas

Understand:
- What AST node type does this schema produce?
- What annotations are attached?
- Are there identifiable properties that distinguish it from similar schemas?

### Step 3: Analyze the Type Signature

Look at the TypeScript type of this schema:
- What is `typeof S.{SCHEMA_NAME}`?
- Does it have any branded types or unique type properties?
- Can TypeScript's conditional types distinguish it from similar schemas?

Test this mentally:
```typescript
type Test = S.{SCHEMA_NAME} extends typeof S.{BASE_SCHEMA} ? true : false;
// Would this be true or false? Why?
```

### Step 4: Check for Runtime Identifiers

Look for runtime identifiers:
- `schemaId` symbols (e.g., `IntSchemaId`, `UUIDSchemaId`)
- `identifier` annotations
- `typeConstructor` patterns
- Custom symbols or tags

**IMPORTANT**: For each identifier found, provide:
- Exact file path and line number
- The symbol/constant definition
- How it's attached to the schema

### Step 5: Evaluate Type-Level Derivation Options

Consider these approaches and evaluate feasibility:

1. **Class identity check**: `Schema extends typeof S.{SCHEMA_NAME}`
   - Does this work? Why or why not?
   - Does TypeScript's `any` handling cause issues?

2. **SchemaId brand check**: Check for a branded type property
   - Does the schema have a unique brand?
   - Can we extract it at the type level?

3. **AST node type check**: Check for specific AST patterns
   - Is there a unique AST structure?
   - Can we match it at the type level?

4. **Encoded type fallback**: Use `DeriveColumnTypeFromEncoded<I>`
   - Would this work for this schema?
   - What would be the result?

### Step 6: Provide Working Code Examples

**CRITICAL REQUIREMENT**: You MUST provide working TypeScript code examples that demonstrate:

1. **How to derive the column type at runtime** using AST inspection:
```typescript
// Example: deriving column type from S.{SCHEMA_NAME}
import * as AST from "effect/SchemaAST";
import * as S from "effect/Schema";

function deriveColumnType(ast: AST.AST): string {
  // Show the exact logic needed to identify this schema
  // and return "{EXPECTED_COLUMN_TYPE}"
}
```

2. **How to derive the column type at the type level** (if possible):
```typescript
// Example: type-level derivation for S.{SCHEMA_NAME}
type DeriveColumnType<Schema> =
  Schema extends typeof S.{SCHEMA_NAME} ? "{EXPECTED_COLUMN_TYPE}" :
  // ... fallback cases
  never;

// Test case:
type Result = DeriveColumnType<typeof S.{SCHEMA_NAME}>; // Should be "{EXPECTED_COLUMN_TYPE}"
```

3. **How to access distinguishing properties**:
```typescript
// Example: accessing the schemaId or other distinguishing property
const schema = S.{SCHEMA_NAME};
const ast = schema.ast;
// Show how to access the property that identifies this schema
```

## Output Format

Create a report in markdown format:

```markdown
# Research Report: S.{SCHEMA_NAME}

## Schema Definition

**File**: `tmp/effect/packages/effect/src/Schema.ts`
**Line number**: {EXACT_LINE_NUMBER}
**Class definition**:
\`\`\`typescript
{PASTE_COMPLETE_DEFINITION}
\`\`\`

**Related symbols**:
| Symbol | File | Line | Purpose |
|--------|------|------|---------|
| {SYMBOL_NAME} | Schema.ts | {LINE} | {PURPOSE} |

## Type Analysis

**Encoded type**: `{ENCODED_TYPE}`
**Decoded type**: `{DECODED_TYPE}`
**Parent class**: `{PARENT_CLASS}`
**Schema ID**: `{SCHEMA_ID}` (or "none")

## AST Structure

**AST node type**: `{AST_NODE_TYPE}` (defined at SchemaAST.ts:{LINE})

**Annotations**:
| Annotation Key | Value | Location |
|----------------|-------|----------|
| {KEY} | {VALUE} | {FILE}:{LINE} |

**Distinguishing AST properties**:
{LIST_PROPERTIES_WITH_PATHS}

## Distinguishing Properties

### At the Type Level
{LIST_PROPERTIES_THAT_EXIST_AT_TYPE_LEVEL}

### At Runtime (AST)
{LIST_PROPERTIES_IN_AST_ANNOTATIONS_WITH_ACCESS_PATHS}

## Code Examples

### Runtime Derivation
\`\`\`typescript
{WORKING_RUNTIME_CODE_EXAMPLE}
\`\`\`

### Type-Level Derivation
\`\`\`typescript
{WORKING_TYPE_LEVEL_CODE_EXAMPLE}
\`\`\`

### Accessing Distinguishing Properties
\`\`\`typescript
{CODE_TO_ACCESS_IDENTIFYING_PROPERTIES}
\`\`\`

## Derivation Feasibility

### Option 1: Class Identity Check
\`\`\`typescript
Schema extends typeof S.{SCHEMA_NAME} ? "{COLUMN_TYPE}" : ...
\`\`\`
**Feasibility**: {WORKS / PARTIAL / FAILS}
**Reason**: {EXPLANATION}

### Option 2: SchemaId Brand Check
**Feasibility**: {WORKS / PARTIAL / FAILS}
**Reason**: {EXPLANATION}
**Access path**: `{AST_PROPERTY_PATH}`

### Option 3: Encoded Type Fallback
\`\`\`typescript
DeriveColumnTypeFromEncoded<S.Schema.Encoded<Schema>>
\`\`\`
**Result**: `"{FALLBACK_RESULT}"`
**Acceptable**: {YES / NO}

## Recommendation

**Best approach**: {RECOMMENDED_APPROACH}
**Confidence**: {HIGH / MEDIUM / LOW}
**Implementation notes**: {NOTES}

**Recommended type-level implementation**:
\`\`\`typescript
{RECOMMENDED_TYPE_DEFINITION}
\`\`\`

## Discovered Issues

{LIST_ANY_ISSUES_FOUND}

## Related Schemas

| Schema | Relationship | Conflict Risk |
|--------|--------------|---------------|
| {SCHEMA} | {RELATIONSHIP} | {HIGH/MEDIUM/LOW} |
```

## File Locations

- Effect Schema source: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect/packages/effect/src/Schema.ts`
- Effect SchemaAST source: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect/packages/effect/src/SchemaAST.ts`
- Current types implementation: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/integrations/sql/dsl/types.ts`

## Output Location

Save your report to:
`/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-derived-column-types/default-column-derivation-research/{SCHEMA_NAME_LOWER}.md`
