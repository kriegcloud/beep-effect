# P6 Alias Compatibility Report

## Summary
- Alias compatibility status: PASS
- Required `Ontology*` bridges are implemented as pure shim re-exports / type aliases.
- Stable and unstable public surfaces remain isolated (`src/index.ts` vs `src/public/unstable.ts`).

## Required Bridge Matrix
| Bridge contract | Shim file | Implementation status | Verification |
| --- | --- | --- | --- |
| `OntologyBase -> OsdkBase` | `packages/common/ontology/src/OntologyBase.ts` | PASS | `OntologyBase` type alias maps to `OsdkBase`; re-exports `ObjectIdentifiers`, `OsdkBase`, `PrimaryKeyType` |
| `OntologyObject -> OsdkObject` | `packages/common/ontology/src/OntologyObject.ts` | PASS | `OntologyObject` type alias maps to `OsdkObject`; `OsdkObject` re-export preserved |
| `OntologyObjectFrom -> OsdkObjectFrom` | `packages/common/ontology/src/OntologyObjectFrom.ts` | PASS | `OntologyObjectFrom` type alias maps to `Osdk.Instance`; `export *` shim to `OsdkObjectFrom` preserved |
| `OntologyObjectPrimaryKey -> OsdkObjectPrimaryKeyType` | `packages/common/ontology/src/OntologyObjectPrimaryKey.ts` | PASS | `OntologyObjectPrimaryKey` type alias maps to `OsdkObjectPrimaryKeyType`; canonical re-export preserved |
| `definitions/LinkDefinition -> definitions/LinkDefinitions` | `packages/common/ontology/src/definitions/LinkDefinition.ts` | PASS | Pure `export *` shim to `LinkDefinitions` |

## Verification Commands
- `node` alias-pattern verification script (file content checks): PASS
- `bun run --cwd packages/common/ontology check`: PASS
- `bun run --cwd packages/common/ontology lint`: PASS (informational `useShorthandFunctionType` hints only, non-blocking)
- `bun run --cwd packages/common/ontology test`: PASS
- `bun run --cwd packages/common/ontology docgen`: PASS
- Symbol-level export parity check against upstream stable + unstable lists: PASS

## Package Entrypoint Compatibility
- `packages/common/ontology/package.json` now includes:
  - `exports["."] = "./src/index.ts"`
  - `exports["./unstable"] = "./src/public/unstable.ts"`
  - `exports["./*"] = "./src/*.ts"`
  - `publishConfig.exports["."] = "./dist/index.js"`
  - `publishConfig.exports["./unstable"] = "./dist/public/unstable.js"`
  - `publishConfig.exports["./*"] = "./dist/*.js"`
- Result: canonical and alias module paths stay import-compatible while unstable remains isolated at `./unstable`.
