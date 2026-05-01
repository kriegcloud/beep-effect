# Golden Slice Contract

The golden fixture is a topology proof, not roadmap code. It uses one synthetic
concept: `fixture-lab/Specimen` at `entities/Specimen`.

`standards/ARCHITECTURE.md` is binding for package topology, role suffixes, and
export boundaries. Generator work must reproduce the checked fixture rather
than reinterpret it.

## Required Roles

| Role | Required proof |
|---|---|
| domain | schema model, status domain, lifecycle rule, domain test |
| use-cases | command, query, service port, typed application error, test |
| config | public config, secrets config, layer entrypoint |
| tables | read-model/table shape and table test |
| server | service implementation and Layer wiring |
| client | facade over the use-case contract |
| ui | simple React surface that consumes a view model |
| exports | stable explicit boundary subpaths; no wildcard package exports |
| package metadata | package name, exports, scripts, dependency roles |
| docs | README per package plus fixture README |
| tests | at least one role-local test for domain, use-cases, tables, server, client, and UI |
| identity | package identity composer snippet |
| config sync | active workspace, alias, tstyche, docgen, and syncpack participation |

## Graduation Rule

The fixture graduates only when the generator:

1. emits the expected tree from the registry;
2. compares cleanly against the live checked fixture workspaces;
3. passes dedicated fixture checks;
4. runs twice in the same output directory;
5. proves the second run is a no-op.

Until then, the fixture is the source of truth and the generator is subordinate
to it.
