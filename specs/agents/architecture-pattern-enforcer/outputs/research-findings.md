# Architecture Pattern Enforcer Research Findings

## Package Structure Map

```
beep-effect/
├── apps/
│   ├── web/              # Next.js App Router frontend
│   ├── server/           # Effect-based backend runtime
│   ├── notes/            # Collaborative notes application
│   ├── todox/            # Task management application
│   └── marketing/        # Marketing website
├── packages/
│   ├── _internal/
│   │   └── db-admin/     # Migration warehouse, Drizzle CLI
│   ├── common/           # Pure utilities, no slice affiliation
│   │   ├── constants/    # Schema-backed enums, asset paths
│   │   ├── contract/     # Effect-first contract system
│   │   ├── errors/       # Logging & telemetry
│   │   ├── identity/     # Package identity
│   │   ├── invariant/    # Assertion contracts
│   │   ├── schema/       # Effect Schema utilities, EntityId
│   │   ├── types/        # Compile-time types
│   │   └── utils/        # Pure runtime helpers
│   ├── shared/           # Cross-slice shared utilities
│   │   ├── domain/       # Cross-slice domain types
│   │   ├── server/       # Cross-slice server utils
│   │   ├── client/       # Cross-slice client utils
│   │   ├── tables/       # Table factories
│   │   ├── ui/           # Shared UI components
│   │   └── env/          # Environment configuration
│   ├── iam/              # Identity & Access Management slice
│   │   ├── domain/       # Layer 1: entities, value objects
│   │   ├── tables/       # Layer 2: database schemas
│   │   ├── server/       # Layer 3: API handlers, repos
│   │   ├── client/       # Layer 4: RPC clients
│   │   └── ui/           # Layer 5: React components
│   ├── documents/        # Documents management slice
│   │   ├── domain/
│   │   ├── tables/
│   │   ├── server/
│   │   ├── client/
│   │   └── ui/
│   ├── comms/            # Communications slice
│   │   ├── domain/
│   │   ├── tables/
│   │   ├── server/
│   │   ├── client/
│   │   └── ui/
│   ├── customization/    # Customization slice
│   │   ├── domain/
│   │   ├── tables/
│   │   ├── server/
│   │   ├── client/
│   │   └── ui/
│   ├── runtime/          # Runtime composition
│   │   ├── client/       # Browser ManagedRuntime
│   │   └── server/       # Server ManagedRuntime
│   └── ui/               # UI layer
│       ├── core/         # Design tokens, MUI overrides
│       └── ui/           # Component library
└── tooling/
    ├── build-utils/      # Next.js config utilities
    ├── cli/              # Repository CLI tools
    ├── repo-scripts/     # Automation scripts
    ├── testkit/          # Effect testing harness
    └── utils/            # FsUtils, RepoUtils
```

## Layer Dependency Matrix

| Layer    | Can Import From                                              |
|----------|--------------------------------------------------------------|
| domain   | shared-domain, common/*                                      |
| tables   | domain, shared-domain, shared-tables, common/*               |
| server   | domain, tables, shared-domain, shared-server, common/*       |
| client   | domain, shared-domain, shared-client, common/*               |
| ui       | domain, client, shared-domain, shared-client, shared-ui, common/* |

## Slice Isolation Rules

| From Slice     | Cannot Import (Forbidden)                                    |
|----------------|--------------------------------------------------------------|
| iam            | @beep/documents-*, @beep/comms-*, @beep/customization-*      |
| documents      | @beep/iam-*, @beep/comms-*, @beep/customization-*            |
| comms          | @beep/iam-*, @beep/documents-*, @beep/customization-*        |
| customization  | @beep/iam-*, @beep/documents-*, @beep/comms-*                |

## Layer Violations (Internal)

| Source Layer | Forbidden Import Patterns                                     |
|--------------|--------------------------------------------------------------|
| domain       | *-tables, *-server, *-client, *-ui                           |
| tables       | *-server, *-client, *-ui                                     |
| server       | *-client, *-ui                                               |
| client       | *-tables, *-server, *-ui                                     |
| ui           | *-tables, *-server                                           |

## Current Violations Found

Based on grep analysis of the codebase:

### Cross-Slice Violations
- **IAM → Documents**: No violations found in source files (only README documentation)
- **Documents → IAM**: Only README documentation references (not actual imports)
- **Comms → IAM**: No violations found
- **Customization → IAM**: No violations found

### Layer Violations
- **IAM Domain → IAM Tables**: No violations found in source files (only documentation)
- **IAM Domain → IAM Server**: No violations found in source files (only documentation)

**Result: No active violations detected in source code**

## Path Alias Reference

### Common Packages
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/types            | packages/common/types           |
| @beep/utils            | packages/common/utils           |
| @beep/schema           | packages/common/schema          |
| @beep/constants        | packages/common/constants       |
| @beep/contract         | packages/common/contract        |
| @beep/errors           | packages/common/errors          |
| @beep/identity         | packages/common/identity        |
| @beep/invariant        | packages/common/invariant       |

### Shared Packages
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/shared-domain    | packages/shared/domain          |
| @beep/shared-server    | packages/shared/server          |
| @beep/shared-client    | packages/shared/client          |
| @beep/shared-tables    | packages/shared/tables          |
| @beep/shared-ui        | packages/shared/ui              |
| @beep/shared-env       | packages/shared/env             |

### IAM Slice
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/iam-domain       | packages/iam/domain             |
| @beep/iam-tables       | packages/iam/tables             |
| @beep/iam-server       | packages/iam/server             |
| @beep/iam-client       | packages/iam/client             |
| @beep/iam-ui           | packages/iam/ui                 |

### Documents Slice
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/documents-domain | packages/documents/domain       |
| @beep/documents-tables | packages/documents/tables       |
| @beep/documents-server | packages/documents/server       |
| @beep/documents-client | packages/documents/client       |
| @beep/documents-ui     | packages/documents/ui           |

### Comms Slice
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/comms-domain     | packages/comms/domain           |
| @beep/comms-tables     | packages/comms/tables           |
| @beep/comms-server     | packages/comms/server           |
| @beep/comms-client     | packages/comms/client           |
| @beep/comms-ui         | packages/comms/ui               |

### Customization Slice
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/customization-domain  | packages/customization/domain   |
| @beep/customization-tables  | packages/customization/tables   |
| @beep/customization-server  | packages/customization/server   |
| @beep/customization-client  | packages/customization/client   |
| @beep/customization-ui      | packages/customization/ui       |

### Runtime Packages
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/runtime-client   | packages/runtime/client         |
| @beep/runtime-server   | packages/runtime/server         |

### UI Packages
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/ui               | packages/ui/ui                  |
| @beep/ui-core          | packages/ui/core                |

### Tooling Packages
| Alias                  | Path                            |
|------------------------|---------------------------------|
| @beep/testkit          | tooling/testkit                 |
| @beep/build-utils      | tooling/build-utils             |
| @beep/repo-cli         | tooling/cli                     |
| @beep/repo-scripts     | tooling/repo-scripts            |
| @beep/tooling-utils    | tooling/utils                   |
| @beep/db-admin         | packages/_internal/db-admin     |

## Package Export Patterns

Based on package.json analysis:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  }
}
```

This consistent export pattern allows:
- Root import: `import { X } from "@beep/iam-domain"`
- Subpath import: `import { Y } from "@beep/iam-domain/entities/User"`
