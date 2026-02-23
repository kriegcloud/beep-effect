# Port API Command - beep-effect codebase

## Purpose

Create a plan to port an API from a previous Effect version to the current Effect 3 patterns used in this codebase.

## Usage

```
/port <api-name>
```

**Example**: `/port Stream.fromIterable`

## Workflow

1. **Research the API** using the Effect documentation MCP tools:
   - `mcp__effect_docs__effect_docs_search` to find the API
   - `mcp__effect_docs__get_effect_doc` to read detailed documentation

2. **Analyze current usage** in the codebase:
   - Search for existing uses: `Grep` with pattern matching the API name
   - Identify all call sites that need updating

3. **Create migration plan** in `specs/port-[api-name]/`:
   - `instructions.md`: Overview and requirements
   - `plan.md`: Step-by-step migration tasks

4. **Document changes** needed:
   - Old signature vs new signature
   - Breaking changes and workarounds
   - Required import changes

## Effect 3 Migration Checklist

- [ ] Update imports to namespace pattern: `import * as Effect from "effect/Effect"`
- [ ] Replace deprecated APIs with Effect 3 equivalents
- [ ] Update to PascalCase constructors (e.g., `S.String` not `S.string`)
- [ ] Use `A.map` instead of `.map()`, etc.
- [ ] Update test patterns to use `@beep/testkit`
- [ ] Verify with `bun run check --filter @beep/[package]`

## Related Documentation

- `.claude/rules/effect-patterns.md` - Import conventions and patterns
- Effect docs MCP - Official Effect documentation
