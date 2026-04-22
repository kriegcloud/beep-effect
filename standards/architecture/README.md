# Architecture Rationale Packet

This folder is the companion packet for
[`standards/ARCHITECTURE.md`](../ARCHITECTURE.md).

`ARCHITECTURE.md` is the binding constitution/tutorial. It tells the repo what
is allowed, what is preferred, and where code belongs. This folder explains why
those rules exist, records the vocabulary, and preserves the decision trail.

## Thesis

beep-effect should be easy to experiment in without becoming easy to damage.
The architecture therefore treats topology as durable product infrastructure:
package boundaries, domain-kind folders, role suffixes, and provider boundaries
are not cosmetic. They are how the repo keeps domain experiments modular,
composable, and reusable.

## Document Index

| Document | Purpose |
|---|---|
| [`GLOSSARY.md`](GLOSSARY.md) | Canonical taxonomy for architecture terms. |
| [`DECISIONS.md`](DECISIONS.md) | Dated decision log and amendment trail. |
| [`00-philosophy.md`](00-philosophy.md) | North star and grounding principles. |
| [`01-hexagonal-vertical-slices.md`](01-hexagonal-vertical-slices.md) | Why slices combine hexagonal ports with vertical package topology. |
| [`02-shared-kernel.md`](02-shared-kernel.md) | Why `shared` is a DDD shared kernel, not a dump. |
| [`03-provider-boundaries.md`](03-provider-boundaries.md) | Why providers expose technical capability while server implements product ports. |
| [`04-rich-domain-model.md`](04-rich-domain-model.md) | Why the repo prefers hybrid rich domain models over anemic data bags. |
| [`05-layer-composition.md`](05-layer-composition.md) | Why slice-local Layer composition replaces runtime God Layers. |

## Relationship To Standards

| Standard | Relationship |
|---|---|
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | Binding architecture constitution. |
| [`../effect-first-development.md`](../effect-first-development.md) | Effect implementation style used inside the architecture. |
| [`../effect-laws-v1.md`](../effect-laws-v1.md) | Repo-wide Effect law checks that implementation must satisfy. |
| [`../memory-architecture/README.md`](../memory-architecture/README.md) | Precedent for standards that close architectural search space. |

## Anti-Goals

- This is not a repo-cli design.
- This is not a codegen matrix.
- This is not a lint implementation plan.
- This is not an archive of every debate.

This packet preserves the reasoning that matters for future design work. The
binding rules live in `ARCHITECTURE.md`.
