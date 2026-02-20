# ../sdk

Generated SDK from canvas schema

## Usage

```typescript
import { /* types */ } from "../sdk";
import { /* schemas */ } from "../sdk";
```

## Generated Source

This SDK was generated from PACK document schema definitions.
It should be depended on as a package in your project, but not modified directly
so that it is easily updatable.

## Development

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

## Schema Format

The types in this SDK were generated from YAML schema files using the following format:

- `local-fragment`: Define reusable field groups
- `add-records`: Add new record types
- `add-union`: Add discriminated unions
- `modify-records`: Modify existing records

Example schema:

```yaml
- local-fragment:
    position:
      x: double
      y: double

- add-records:
    Point:
      extends: [position]
      fields:
        label: optional<string>
```

Note: To regenerate the SDK with updated schemas, use the `sdkgen` CLI with new schema files.



## License

UNLICENSED
