# BeepId collection helper proposals

Context: files like `packages/iam/sdk/src/clients/_internal/_id.ts` hand-roll dozens of IDs by composing the same base and concatenating segments. Below are candidate APIs that add a collection helper to `BeepId`/`IdentityComposer` to remove that boilerplate while keeping branded types and validation.

## Goals
- Preserve literal types for each entry (branded `IdentityString` / `IdentitySymbol`).
- Keep segment validation (`ensureSegment`) intact; no hidden string concatenation in callers.
- Avoid runtime allocations beyond a single pass over the definition object.
- Keep ergonomics similar to current fluent API (`compose`/`make`/`symbol`/`annotations`).

## Option 1 — `collection(definition, mode?)`
- Shape: `collection<RecordKey extends string, Segment extends SegmentValue>(definition: Record<RecordKey, Segment>, mode?: "composer" | "string" | "symbol")`.
- Default `mode: "composer"` returns composers keyed by the record keys.
- With `mode: "string"` returns branded strings; `mode: "symbol"` returns branded symbols.
- Example:
```ts
import { IamSdkId } from "@beep/identity/modules";

const Clients = IamSdkId.compose("clients").collection(
  {
    AdminId: "admin",
    ApiKeyId: "api-key",
    PasskeyClientId: "passkey",
  } as const
);

// Clients.AdminId: IdentityComposer<"@beep/iam-sdk/clients/admin">
// Clients.ApiKeyId.string(): IdentityString<"@beep/iam-sdk/clients/api-key">
```
- Strengths: single method covers composers/strings/symbols; mirrors existing naming style; minimal new API surface.
- Weaknesses: optional `mode` union could complicate type inference unless overloads are provided.

## Option 2 — `makeCollection(definition)`
- Shape: `makeCollection<RecordKey extends string, Segment extends SegmentValue>(definition: Record<RecordKey, Segment>) => Record<RecordKey, IdentityString<...>>`.
- Always returns branded strings; dedicated to replacing repetitive `.make` calls.
- Example:
```ts
const ClientIds = IamSdkId.compose("clients").makeCollection({
  AdminId: "admin",
  ApiKeyId: "api-key",
  DeviceClientId: "device-authorization",
} as const);

// ClientIds.AdminId === "@beep/iam-sdk/clients/admin" (branded)
```
- Strengths: zero ambiguity about return shape; ideal for static ID constants.
- Weaknesses: callers still need `collection`/`symbol` variants if they want composers or symbols.

## Option 3 — `composeCollection(definition)`
- Shape: `composeCollection<RecordKey extends string, Segment extends SegmentValue>(definition: Record<RecordKey, Segment>) => Record<RecordKey, IdentityComposer<...>>`.
- Forces composer return to allow further chaining (`.compose().make()`), useful for nested namespaces.
- Example:
```ts
const Clients = IamSdkId.compose("clients").composeCollection({
  Admin: "admin",
  ApiKey: "api-key",
  OAuth: "oauth",
} as const);

// Compose deeper:
const AdminSessionId = Clients.Admin.compose("session").make("start");
```
- Strengths: encourages continued fluent composition; keeps `.identifier`/`.symbol()` reachable per entry.
- Weaknesses: separate method from `makeCollection` unless merged via `mode` option.

## Option 4 — `annotateCollection(definition, extras?)`
- Shape: `annotateCollection<RecordKey extends string, Segment extends SegmentValue, SchemaType>(definition: Record<RecordKey, Segment>, extras?: SchemaAnnotationExtras<SchemaType> | Partial<Record<RecordKey, SchemaAnnotationExtras<SchemaType>>>)`.
- Returns annotations objects keyed by the record keys, suitable for schema decorators.
- Example:
```ts
const SchemaAnnotations = IamSdkId.compose("clients").annotateCollection(
  { Passkey: "passkey", OAuth: "oauth" } as const,
  { description: "IAM client" }
);

// Schema.annotations(UserSchema, SchemaAnnotations.Passkey);
```
- Strengths: parallel to existing `.annotations()` helper; keeps schema metadata centralized.
- Weaknesses: slightly heavier surface; may be niche outside schema-heavy modules.

## Compatibility notes
- All options assume the helper lives on `IdentityComposer` and internally reuses `ensureSegment` to avoid drifting validation rules.
- Implementation can rely on `effect/Array` + `effect/Record` instead of native iteration to stay consistent with repo guardrails.
- Overloads can keep `mode` switches type-safe without forcing callers into generics.
