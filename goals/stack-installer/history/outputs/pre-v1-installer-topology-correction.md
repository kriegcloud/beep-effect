# Pre-v1 Installer Topology Correction

Status: accepted.

This output records the documentation-side topology correction for the Stack
Installer before v1 compatibility exists.

## Correction

The active installer target is one slice with role packages:

- `packages/installer/domain` / `@beep/installer-domain`
- `packages/installer/use-cases` / `@beep/installer-use-cases`
- `packages/installer/server` / `@beep/installer-server`

The earlier category slice plan is retired as target topology:

- `installer-dependencies`
- `installer-security`
- `installer-providers`
- `installer-channels`
- `installer-workspace`

Those names remain historical evidence in older P1 outputs. They are not
compatibility aliases, sunset package names, or the desired v1 topology.

## Rationale

The category slices were useful scaffolding while P1A/P1 proof surfaces were
being explored, but before v1 they create more package topology than the
installer domain currently needs. Dependencies, security, providers, channels,
and workspace are installer concepts today, not independently versioned product
slices with separate lifecycle pressure.

One installer slice keeps the boundary explicit while reducing coordination
cost:

- domain models, validation events, and manifest contracts live in
  `@beep/installer-domain`
- verbs and application workflows live in `@beep/installer-use-cases`
- driver-backed implementations live in `@beep/installer-server`
- the app consumes the installer packages directly instead of composing
  category packages

## Migration Waiver

Because this correction happens before v1 compatibility exists, all known
consumers migrate in the same PR. The correction intentionally does not add
compatibility wrappers, sunset aliases, or deprecation packages for the retired
category slice names.

A separate installer config package is also deferred. The required Bun version
contract remains installer-owned, but a config package should not exist until
there is real installer configuration with enough independent surface to justify
one.

## Packet Updates

The active packet docs now say P1A and P1D use the single installer slice, and
the app consumes `@beep/installer-domain`, `@beep/installer-use-cases`, and
`@beep/installer-server`.

Older history outputs are intentionally left unchanged as historical evidence
of the pre-correction P1A/P1 review state.
