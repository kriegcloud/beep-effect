# @palantir/pack.document-schema.type-gen

TypeScript type generation from document schema definitions. This package provides CLI tools and programmatic APIs for generating TypeScript types and Zod schemas from document schema definitions in both IR (Intermediate Representation) and YAML migration steps formats.

## CLI Usage

### Available Commands

```
Usage: document-schema-type-gen [options] [command]

Document schema type generation CLI

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  ir              IR (Intermediate Representation) based generation commands
  schema          Commands for working with TypeScript schema definitions
  steps           Commands dealing with migration steps and type generation
  help [command]  display help for command
```

#### Steps Commands

Generate types and schemas from YAML migration steps:

```bash
# Generate TypeScript types from YAML migration steps
type-gen steps types -i <yaml-folder> -o <output-file>

# Convert YAML migration steps to IR format
type-gen steps ir -i <input.yaml> -o <output.json> [options]
  Options:
    -n, --schema-name <name>          Override schema name (default: "Generated Schema")
    -d, --schema-description <desc>   Override schema description (default: "Schema generated from migration steps")
    -v, --version <version>           Schema version (default: "1")

# Generate Zod schemas from YAML migration steps
type-gen steps zod -i <input.yaml> -o <output.ts>

# Generate Model constants from YAML migration steps
type-gen steps models -i <input.yaml> -o <output.ts>
```

#### IR Commands

Generate schemas from Intermediate Representation format:

```bash
# Generate Zod schemas from IR format
type-gen ir zod -s <schema.json> -r <records.json> -o <output.ts>
```

### Examples

#### Generating TypeScript Types from YAML

Given a directory with YAML migration step files:

```yaml
# 001-initial.yaml
- local-fragment:
    position:
      x: double
      y: double

- add-records:
    Node:
      docs: "A node in the graph"
      extends: [position]
      fields:
        label: optional<string>
        edges: list<Edge>

- add-union:
    NodeType:
      standard: Node
      special: SpecialNode
```

Run:

```bash
type-gen steps types -i ./schemas -o ./generated/types.ts
```

This generates TypeScript interfaces for all defined records and unions.

#### Converting YAML to IR Format

```bash
type-gen steps ir \
  -i ./schema.yaml \
  -o ./schema-ir.json \
  -n "MySchema" \
  -d "Application document schema" \
  -v "2.0"
```

#### Generating Zod Schemas

From YAML:

```bash
type-gen steps zod -i ./schema.yaml -o ./generated/zod-schemas.ts
```

From IR:

```bash
type-gen ir zod -s ./schema.json -r ./records.json -o ./generated/zod-schemas.ts
```

## Programmatic API

All CLI commands and their handlers are exported for composition in other tools and libraries.

### Command Registration

Register commands in your own CLI:

```typescript
import {
  registerIrCommands,
  registerStepsCommands,
} from "@palantir/pack.document-schema.type-gen";
import { Command } from "commander";

const program = new Command();

// Register IR-based commands
registerIrCommands(program);

// Register steps-based commands
registerStepsCommands(program);

program.parse();
```

### Direct Handler Usage

Use command handlers directly in your code:

```typescript
import {
  convertSchemaToIr,
  convertStepsToIr,
  generateTypesFromSchema,
  generateZodFromSchema,
  generateZodSchemasFromIr,
} from "@palantir/pack.document-schema.type-gen";

// Generate TypeScript types from a schema object
const schema = {/* your schema definition */};
const typesCode = generateTypesFromSchema(schema);

// Generate Zod schemas from migration steps
const zodCode = generateZodFromSchema(schema);

// Convert migration steps to IR format
const irSchema = convertStepsToIr(steps, metadata);

// Generate Zod from IR
const zodFromIr = await generateZodSchemasFromIr(irSchema);
```

### Utility Functions

The package exports several utility functions for schema processing:

```typescript
import {
  convertRecordDefToIr,
  convertSchemaToIr,
  convertTypeToFieldTypeUnion,
  generateZodFromStepsSchema,
  type SchemaMetadata,
} from "@palantir/pack.document-schema.type-gen";

// Convert PACK types to field type unions
const fieldType = convertTypeToFieldTypeUnion(type);

// Convert record definitions to IR format
const irRecord = convertRecordDefToIr(recordDef);

// Generate Zod schemas from steps with custom metadata
const metadata: SchemaMetadata = {
  name: "MySchema",
  description: "Custom schema",
  version: "1.0.0",
};
const zodSchemas = generateZodFromStepsSchema(steps, metadata);
```

### Building a Custom CLI

```typescript
import { cli } from "@palantir/pack.document-schema.type-gen";

// Use the built-in CLI with custom arguments
cli(process.argv);

// Or build your own CLI using the exported handlers
import { stepsGenTypesHandler } from "@palantir/pack.document-schema.type-gen";
import { Command } from "commander";

const program = new Command();

program
  .command("generate-types")
  .requiredOption("-i, --input <folder>", "Input folder")
  .requiredOption("-o, --output <file>", "Output file")
  .action(stepsGenTypesHandler);

program.parse();
```

## Supported Field Types

The type generator supports the following field types in YAML:

- Basic types: `string`, `double`, `boolean`
- Collections: `array<T>`, `list<T>`, `set<T>`
- Optional types: `optional<T>`
- References to other defined records
- Nested structures via record extension

## Migration Steps Format

The YAML migration steps support these operations:

- `local-fragment`: Define reusable field groups
- `add-records`: Add new record types with fields
- `add-union`: Define discriminated unions
- `modify-records`: Modify existing record definitions
