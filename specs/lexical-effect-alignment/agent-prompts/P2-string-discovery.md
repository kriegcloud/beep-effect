# P2 String Discovery Agent

## Your Mission

Scan the specified scope for native JavaScript String method violations and produce a checklist document.

## Scope

Same batching as P1:
- **Batch 1**: `nodes/`, `plugins/A*-F*`
- **Batch 2**: `plugins/G*-M*`
- **Batch 3**: `plugins/N*-Z*`
- **Batch 4**: `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level files

Base path: `apps/todox/src/app/lexical/`

## Target Patterns

Search for these native String patterns:

### Method Calls on Strings
```
\.split\(
\.toLowerCase\(\)
\.toUpperCase\(\)
\.trim\(\)
\.trimStart\(\)
\.trimEnd\(\)
\.slice\(
\.substring\(
\.startsWith\(
\.endsWith\(
\.includes\(
\.replace\(
\.replaceAll\(
\.charAt\(
\.charCodeAt\(
\.padStart\(
\.padEnd\(
\.repeat\(
\.concat\(
\.indexOf\(
\.lastIndexOf\(
\.search\(
\.localeCompare\(
\.normalize\(
```

### Property Access
```
\.length(?!\s*[=!<>])  # .length not followed by comparison (to avoid array.length)
```

**Note**: Be careful to distinguish string.length from array.length by context.

## Replacement Reference

| Native | Effect Replacement | Import |
|--------|-------------------|--------|
| `.split(sep)` | `Str.split(str, sep)` | `import * as Str from "effect/String"` |
| `.toLowerCase()` | `Str.toLowerCase(str)` | |
| `.toUpperCase()` | `Str.toUpperCase(str)` | |
| `.trim()` | `Str.trim(str)` | |
| `.trimStart()` | `Str.trimStart(str)` | |
| `.trimEnd()` | `Str.trimEnd(str)` | |
| `.slice(start, end)` | `Str.slice(str, start, end)` | |
| `.substring(start, end)` | `Str.slice(str, start, end)` | |
| `.startsWith(prefix)` | `Str.startsWith(str, prefix)` | |
| `.endsWith(suffix)` | `Str.endsWith(str, suffix)` | |
| `.includes(search)` | `Str.includes(str, search)` | |
| `.replace(search, rep)` | `Str.replace(str, search, rep)` | |
| `.replaceAll(search, rep)` | `Str.replaceAll(str, search, rep)` | |
| `.charAt(idx)` | `Str.charAt(str, idx)` | Returns `Option` |
| `.charCodeAt(idx)` | `Str.charCodeAt(str, idx)` | Returns `Option` |
| `.padStart(len, fill)` | `Str.padStart(str, len, fill)` | |
| `.padEnd(len, fill)` | `Str.padEnd(str, len, fill)` | |
| `.repeat(count)` | `Str.repeat(str, count)` | |
| `.length` | `Str.length(str)` | |
| `.concat(str2)` | `Str.concat(str, str2)` | |

## Output Format

Create: `specs/lexical-effect-alignment/outputs/P2-discovery-[batch].md`

```markdown
# P2 String Discovery - Batch [N]

## Summary
- Files scanned: [count]
- Violations found: [count]
- Unique files with violations: [count]

## Checklist

### [relative/path/to/file.ts]
- [ ] `full/path:LINE` - `.toLowerCase()` - Replace with `Str.toLowerCase(str)`
```

## Critical Rules

1. **NO CODE CHANGES** - Only produce the checklist
2. **EXACT LINE NUMBERS** - Use actual line numbers from source
3. **CONTEXT MATTERS** - Ensure the method is called on a string type
4. **ONE ITEM PER VIOLATION** - Even if same line has multiple issues

## Exclusions

Do NOT flag:
- TypeScript type annotations
- Comments
- String literals containing method names
- JSX attribute names that happen to match
