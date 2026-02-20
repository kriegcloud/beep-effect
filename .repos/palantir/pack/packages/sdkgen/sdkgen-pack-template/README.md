# @palantir/pack.sdkgen.pack-template

PACK SDK template for generating TypeScript types and Zod schemas from YAML schema definitions.

## Overview

This template generates a TypeScript SDK with:

- TypeScript type definitions from YAML schemas
- Zod schema validators for runtime validation
- ESM-only module output
- Prettier and ESLint configuration
- Full TypeScript strict mode

## Usage

```bash
# Generate an SDK from YAML schema files
npx @palantir/pack.sdkgen create my-sdk \
  --template @palantir/pack.sdkgen.pack-template \
  --schema ./path/to/schema.yaml

# With a directory of YAML files
npx @palantir/pack.sdkgen create my-sdk \
  --template @palantir/pack.sdkgen.pack-template \
  --schema ./path/to/schemas/
```

## How It Works

1. **Schema Processing**: When you provide a schema via `--schema`, the template copies it to the generated SDK
2. **Type Generation**: The `afterGenerate` hook automatically runs `@palantir/pack.document-schema.type-gen` to generate:
   - TypeScript types in `src/types.ts`
   - Zod schemas in `src/schema.ts`
3. **SDK Structure**: Creates a complete TypeScript package with build configuration

## Template Architecture

### Hook Execution

This template uses an `afterGenerate` hook that runs in the template's Node.js context with access to the template's dependencies. The hook:

- Runs as a child process with the template's `node_modules` available
- Uses `@palantir/pack.document-schema.type-gen` (a dependency of this template) to generate types
- Only generates types if a schema was provided via the `--schema` flag

### Dependencies

The template package has its own dependencies:

- `@palantir/pack.document-schema.type-gen` - For generating types and Zod schemas
- `fs-extra` - For file system operations

The generated SDK has minimal runtime dependencies:

- `zod` - For runtime schema validation

## Generated SDK Structure

```
my-sdk/
├── src/
│   ├── index.ts      # Re-exports types and schemas
│   ├── types.ts      # Generated TypeScript types
│   └── schema.ts     # Generated Zod schemas
├── build/            # Compiled output (after build)
├── package.json      # ESM-only configuration
├── tsconfig.json     # TypeScript configuration
├── eslint.config.mjs # ESLint flat config
├── .prettierrc.json  # Prettier configuration
└── README.md         # SDK documentation
```

## Schema Format

The template supports YAML schemas in the document-schema format:

```yaml
- local-fragment:
    position:
      x: double
      y: double

- add-records:
    Point:
      docs: "A point in 2D space"
      extends: [position]
      fields:
        label: optional<string>
        color: string

- add-union:
    Shape:
      circle: Circle
      rectangle: Rectangle
      point: Point
```

Supported types:

- Primitives: `string`, `double`, `boolean`, `int32`, `int64`
- Collections: `array<T>`, `list<T>`, `map<K, V>`
- Modifiers: `optional<T>`, `nullable<T>`
- References: to other defined records

## Development

### Building the Template

```bash
pnpm build
pnpm test
```

### Testing

The template includes tests that verify:

- Template configuration
- File structure
- Hook execution
- Type generation

## Compatibility

This template requires:

- `@palantir/pack.sdkgen` CLI (any version that supports child process hooks)
- Node.js 18+ (for native ESM support)
- `@palantir/pack.document-schema.type-gen` for type generation

The template specifies its compatible sdkgen version in its `devDependencies`.
