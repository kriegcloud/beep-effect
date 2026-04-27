# Generator Direction

The generator belongs to the repo CLI. The public operation should feel like a
normal `beep` command:

```bash
bun run beep architecture generate --registry path/to/registry.json
```

`@turbo/gen` is not the core. It can be added later as a wrapper that delegates
to the command above if interactive Turbo scaffolding becomes useful.

## Pipeline

1. Decode a schema-backed architecture registry.
2. Normalize registry input into a generation plan.
3. Select writers by target file kind.
4. Render leaf source/docs with Handlebars templates extracted from the golden
   fixture.
5. Write JSON, JSONC, package metadata, docgen, manifests, and tsconfig updates
   through structured writers.
6. Use `ts-morph` only when the mutation needs TypeScript semantics: imports,
   exports, identity composer wiring, generated indexes, and stable ordering.

## Writer Rules

- Handlebars owns reviewable source and markdown leaves.
- Structured JSON/JSONC writers own machine files.
- `ts-morph` owns semantic TypeScript rewrites.
- Plain string replacement is allowed only inside a template renderer or an
  already-decoded document update.

## First Implementation Slice

The first CLI slice is not "generate a product feature." It is:

- parse the `fixture-lab/Specimen` registry;
- render a normalized plan;
- copy/render the live golden fixture shape into a temp directory;
- compare against the checked `packages/fixture-lab/specimen/*` output;
- run twice and assert the second run writes nothing.
