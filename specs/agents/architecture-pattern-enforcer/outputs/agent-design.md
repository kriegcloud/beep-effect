# Architecture Pattern Enforcer - Agent Design

## Validation Methodology

### 1. Structure Validation
- Verify folder organization matches slice pattern
- Check required files exist (package.json, tsconfig.json, src/index.ts)
- Validate naming conventions (kebab-case files, PascalCase types)

### 2. Layer Validation
- Parse imports from each source file
- Check against layer dependency rules
- Flag upward or lateral layer imports

### 3. Cross-Slice Validation
- Detect direct slice-to-slice imports
- Verify all cross-slice access goes through shared/*
- Check for slice isolation violations

### 4. Export Validation
- Check package.json exports structure
- Verify barrel exports (index.ts) exist
- Flag over-exposed or under-exposed APIs

## Detection Pattern Library

### Cross-Slice Detection Patterns

```bash
# IAM slice should never import from other slices
grep -r "from [\"']@beep/(documents|comms|customization)" packages/iam/

# Documents slice should never import from other slices
grep -r "from [\"']@beep/(iam|comms|customization)" packages/documents/

# Comms slice should never import from other slices
grep -r "from [\"']@beep/(iam|documents|customization)" packages/comms/

# Customization slice should never import from other slices
grep -r "from [\"']@beep/(iam|documents|comms)" packages/customization/
```

### Layer Violation Patterns

```bash
# Domain should never import from tables, server, client, ui
grep -r "from [\"']@beep/[^\"']*-(tables|server|client|ui)" packages/*/domain/src/

# Tables should never import from server, client, ui
grep -r "from [\"']@beep/[^\"']*-(server|client|ui)" packages/*/tables/src/

# Server should never import from client, ui
grep -r "from [\"']@beep/[^\"']*-(client|ui)" packages/*/server/src/

# Client should never import from tables, server
grep -r "from [\"']@beep/[^\"']*-(tables|server)" packages/*/client/src/
```

### Path Alias Violation Patterns

```bash
# Detect relative imports escaping package
grep -r "from [\"']\.\./\.\./\.\./" packages/

# Detect direct package paths
grep -r "from [\"']\.\.\/packages\/" packages/
```

## Output Format

```markdown
# Architecture Audit: [Package/Slice Name]

## Summary
- **Scope**: [Package|Slice|Monorepo]
- **Target**: [path]
- **Date**: [ISO date]

## Structure Validation
| Check | Status | Notes |
|-------|--------|-------|
| Folder organization | ✅/❌ | |
| Required files | ✅/❌ | |
| Naming conventions | ✅/❌ | |

## Layer Validation
| File | Current Layer | Invalid Import | Violation Type |
|------|---------------|----------------|----------------|

## Cross-Slice Violations
### Violation 1
**File**: packages/iam/server/src/AuthHandler.ts:42
**Import**: `from "@beep/documents-domain"`
**Problem**: Direct cross-slice import
**Fix**:
```typescript
// Move shared types to @beep/shared-domain
import { SharedType } from "@beep/shared-domain"
```

## Export Surface Analysis
| Package | Public Exports | Recommended |
|---------|---------------|-------------|

## Recommended Restructuring
[If major changes needed]

## Summary Statistics
- **Structure**: PASS/FAIL
- **Layers**: PASS/FAIL (N violations)
- **Cross-Slice**: PASS/FAIL (N violations)
- **Exports**: PASS/FAIL
```

## Slice Configuration Reference

### Vertical Slices
1. **iam** - Identity & Access Management
2. **documents** - Document management
3. **comms** - Communications
4. **customization** - User customization

### Layer Order
```
domain (1) → tables (2) → server (3) → client (4) → ui (5)
```

Dependencies can only flow DOWN (right to left in the above diagram).

### Shared Packages (Cross-Slice Bridge)
- `@beep/shared-domain` - Cross-slice entities and value objects
- `@beep/shared-server` - Cross-slice server utilities
- `@beep/shared-client` - Cross-slice client utilities
- `@beep/shared-tables` - Table factories
- `@beep/shared-ui` - Shared UI components
- `@beep/shared-env` - Environment configuration

### Common Packages (Pure Utilities)
- `@beep/types` - Compile-time types
- `@beep/utils` - Pure runtime helpers
- `@beep/schema` - Effect Schema utilities
- `@beep/constants` - Schema-backed enums
- `@beep/contract` - Effect-first contracts
- `@beep/errors` - Logging & telemetry
- `@beep/identity` - Package identity
- `@beep/invariant` - Assertion contracts
