---
title: ProofManifest.ts
nav_order: 11
parent: "@beep/repo-docgen"
---

## ProofManifest.ts overview

Package-level proof manifests for docgen generation.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DocgenProofManifest (class)](#docgenproofmanifest-class)
  - [DocgenProofManifestFile (class)](#docgenproofmanifestfile-class)
  - [DocgenProofManifestFingerprint (class)](#docgenproofmanifestfingerprint-class)
  - [DocgenProofManifestSchemaVersion](#docgenproofmanifestschemaversion)
  - [DocgenProofManifestStandard](#docgenproofmanifeststandard)
  - [DocgenProofManifestStatus](#docgenproofmanifeststatus)
  - [DocgenProofManifestVerification (class)](#docgenproofmanifestverification-class)
- [type-level](#type-level)
  - [DocgenProofManifestSchemaVersion (type alias)](#docgenproofmanifestschemaversion-type-alias)
  - [DocgenProofManifestStandard (type alias)](#docgenproofmanifeststandard-type-alias)
  - [DocgenProofManifestStatus (type alias)](#docgenproofmanifeststatus-type-alias)
- [workflows](#workflows)
  - [verifyDocgenProofManifest](#verifydocgenproofmanifest)
  - [writeDocgenProofManifest](#writedocgenproofmanifest)
---

# models

## DocgenProofManifest (class)

Package-local docgen proof manifest written after successful generation.

**Signature**

```ts
declare class DocgenProofManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L128)

Since v0.0.0

## DocgenProofManifestFile (class)

File-level SHA-256 digest included in a docgen proof manifest.

**Signature**

```ts
declare class DocgenProofManifestFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L89)

Since v0.0.0

## DocgenProofManifestFingerprint (class)

Package input and generated-docs fingerprint for docgen reuse.

**Signature**

```ts
declare class DocgenProofManifestFingerprint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L106)

Since v0.0.0

## DocgenProofManifestSchemaVersion

Literal schema version written into proof manifests.

**Signature**

```ts
declare const DocgenProofManifestSchemaVersion: AnnotatedSchema<LiteralKit<readonly ["1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L49)

Since v0.0.0

## DocgenProofManifestStandard

Literal marker written into proof manifests to identify the document format.

**Signature**

```ts
declare const DocgenProofManifestStandard: AnnotatedSchema<LiteralKit<readonly ["docgen-proof-manifest"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L29)

Since v0.0.0

## DocgenProofManifestStatus

Verification status for a package-local docgen proof manifest.

**Signature**

```ts
declare const DocgenProofManifestStatus: AnnotatedSchema<LiteralKit<readonly ["current", "missing", "stale"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L69)

Since v0.0.0

## DocgenProofManifestVerification (class)

Result of checking a package-local docgen proof manifest.

**Signature**

```ts
declare class DocgenProofManifestVerification
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L151)

Since v0.0.0

# type-level

## DocgenProofManifestSchemaVersion (type alias)

Type-level representation of the proof manifest schema version.

**Signature**

```ts
type DocgenProofManifestSchemaVersion = typeof DocgenProofManifestSchemaVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L61)

Since v0.0.0

## DocgenProofManifestStandard (type alias)

Type-level representation of the proof manifest format marker.

**Signature**

```ts
type DocgenProofManifestStandard = typeof DocgenProofManifestStandard.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L41)

Since v0.0.0

## DocgenProofManifestStatus (type alias)

Verification status for a package-local docgen proof manifest.

**Signature**

```ts
type DocgenProofManifestStatus = typeof DocgenProofManifestStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L81)

Since v0.0.0

# workflows

## verifyDocgenProofManifest

Verify whether a package-local docgen proof manifest matches current inputs and outputs.

**Signature**

```ts
declare const verifyDocgenProofManifest: (packagePath: string, packageName: string) => Effect.Effect<DocgenProofManifestVerification, Domain.DocgenError, FileSystem.FileSystem | Path.Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L350)

Since v0.0.0

## writeDocgenProofManifest

Write the current package's docgen proof manifest after successful generation.

**Signature**

```ts
declare const writeDocgenProofManifest: () => Effect.Effect<DocgenProofManifest, Domain.DocgenError, FileSystem.FileSystem | Path.Path | Configuration.Configuration | Domain.Process | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/ProofManifest.ts#L296)

Since v0.0.0