# Schema — Agent Context

> Best practices for using `effect/Schema` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `S.Struct` | Define object schema (ALWAYS PascalCase) | `S.Struct({ name: S.String })` |
| `S.String` | String validation | `S.String` |
| `S.Number` | Number validation | `S.Number` |
| `S.TaggedError` | Define typed error classes | `class MyError extends S.TaggedError<MyError>()("MyError", { ... })` |
| `S.Class` | Define domain model classes | `class User extends S.Class<User>("User")({ ... })` |
| `S.optional` | Optional field (undefined allowed) | `S.optional(S.String)` |
| `S.optionalWith` | Optional field with nullable | `S.optionalWith(S.String, { nullable: true })` |
| `S.Literal` | Literal value type | `S.Literal("active", "inactive")` |
| `S.Union` | Union type | `S.Union(S.String, S.Number)` |
| `S.Array` | Array validation | `S.Array(S.String)` |
| `S.decode` | Validate and transform input | `S.decode(UserSchema)(unknownInput)` |
| `S.encode` | Encode back to wire format | `S.encode(UserSchema)(user)` |

## Codebase Patterns

### Domain Models with M.Class

Use `@effect/sql/Model` classes for database entities:

```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

// REQUIRED - Domain model pattern
export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,          // Branded entity ID
  userId: SharedEntityIds.UserId,      // Branded entity ID
  organizationId: SharedEntityIds.OrganizationId,
  role: S.Literal("admin", "member"),
  email: BS.EmailBase,                 // Custom helper from @beep/schema
  createdAt: S.Date,                   // JavaScript Date in memory
  updatedAt: S.Date,
  deletedAt: S.NullOr(S.Date),        // Nullable date
}) {}
```

**Key patterns**:
- ALWAYS use branded `EntityId` types (NEVER plain `S.String`)
- Use `M.Class` for database models
- Use `S.Class` for DTOs and client schemas

### Branded EntityIds (MANDATORY)

NEVER use plain strings for entity IDs. ALWAYS use branded types:

```typescript
// FORBIDDEN - Plain strings
export class Member extends M.Class<Member>("Member")({
  id: S.String,           // Wrong! No type safety
  userId: S.String,       // Wrong! Can mix up IDs
}) {}

// REQUIRED - Branded EntityIds
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
}) {}

// Creating new IDs
const memberId = IamEntityIds.MemberId.create();  // Generates UUID with prefix

// Validating IDs
const validated = IamEntityIds.MemberId.make(stringValue);  // Throws if invalid

// Type guard
if (IamEntityIds.MemberId.is(value)) {
  // value is typed as MemberId.Type
}
```

**Available EntityId modules**:
- `SharedEntityIds` - UserId, OrganizationId, TeamId, SessionId, FileId, FolderId
- `IamEntityIds` - MemberId, RoleId, PermissionId, InvitationId, ApiKeyId
- `DocumentsEntityIds` - DocumentId, DocumentVersionId, CommentId
- `KnowledgeEntityIds` - EntityId, OntologyId, RelationId, SameAsLinkId
- `CalendarEntityIds` - EventId, AvailabilityId, RecurrenceId

### Tagged Errors for Type-Safe Error Handling

Define error classes using `S.TaggedError`:

```typescript
import * as S from "effect/Schema";

// REQUIRED - Tagged error pattern
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  {
    resource: S.String,
    id: S.String,
  }
) {}

export class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  {
    field: S.String,
    message: S.String,
  }
) {}

// Usage in Effect
const program = Effect.gen(function* () {
  const user = yield* UserRepo.findById(userId);
  if (!user) {
    return yield* Effect.fail(
      new NotFoundError({ resource: "User", id: userId })
    );
  }
  return user;
}).pipe(
  Effect.catchTag("NotFoundError", (error) =>
    Effect.succeed(defaultUser)
  )
);
```

**Why tagged errors**:
- Type-safe error handling with `Effect.catchTag`
- Automatic serialization for RPC
- Better stack traces and logging

### Schema Type Selection

Choose the correct Schema type based on runtime representation:

```typescript
// DATES
createdAt: S.Date                  // JavaScript Date object in memory
timestamp: S.DateFromString        // ISO 8601 string from API/JSON
deletedAt: S.NullOr(S.Date)        // Date or null

// OPTIONALS
nickname: S.optional(S.String)                           // string | undefined
ipAddress: S.optionalWith(S.String, { nullable: true })  // string | null | undefined

// SENSITIVE FIELDS (use @beep/schema helpers)
password: BS.FieldSensitiveOptionOmittable(S.String)     // Suppressed in logs
apiKey: BS.FieldSensitiveOptionOmittable(S.String)       // Suppressed in logs

// BOOLEANS WITH DEFAULTS
isActive: BS.BoolWithDefault(true)                       // Defaults to true if undefined

// VALIDATION
email: BS.EmailBase                                      // Email validation
username: BS.NonEmptyString                              // Non-empty string
```

**Key decisions**:
- `S.Date` - Working with Date objects in memory
- `S.DateFromString` - Receiving ISO strings from APIs
- `S.optional` - Field may be undefined
- `S.optionalWith({ nullable: true })` - Field may be null OR undefined
- `BS.FieldSensitiveOptionOmittable` - User credentials (passwords, API keys)
- Plain `S.String` - Server-generated tokens (already protected)

### @beep/schema Helpers (BS)

ALWAYS prefer BS helpers over manual composition:

```typescript
import { BS } from "@beep/schema";

// REQUIRED - Use helpers
const Schema = S.Struct({
  isActive: BS.BoolWithDefault(false),                    // Boolean with default
  nickname: BS.FieldOptionOmittable(S.String),            // Optional field
  apiKey: BS.FieldSensitiveOptionOmittable(S.String),     // Sensitive optional
  email: BS.EmailBase,                                    // Email validation
  username: BS.NonEmptyString,                            // Non-empty string
  timestamp: BS.DateTimeUtcFromAllAcceptable              // DateTime from any format
});

// FORBIDDEN - Manual composition
const Schema = S.Struct({
  isActive: S.optional(S.Boolean).pipe(S.withDefault(() => false)),  // Verbose!
  nickname: S.optional(S.String),                                    // Missing omit behavior
  apiKey: S.optional(S.String),                                      // Not marked sensitive!
});
```

### Transformation Schemas for External APIs

When mapping external API responses to domain entities, create transformation schemas:

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";

// External API schema (Better Auth, third-party, etc.)
const BetterAuthMemberSchema = S.Struct({
  id: S.String,              // Plain string from API
  email: S.String,
  role: S.String,
  createdAt: S.String,       // ISO string from API
});

// REQUIRED - Transform to domain model
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  DomainMember.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthMember, _options, ast) {
      // Validate branded ID format
      if (!IamEntityIds.MemberId.is(betterAuthMember.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthMember.id, "Invalid member ID format")
        );
      }

      // Transform fields
      return {
        id: betterAuthMember.id as IamEntityIds.MemberId.Type,
        email: betterAuthMember.email,
        role: betterAuthMember.role as "admin" | "member",
        createdAt: new Date(betterAuthMember.createdAt),
        updatedAt: new Date(betterAuthMember.updatedAt),
      };
    }),
    encode: (domainMember) => ({
      id: domainMember.id,
      email: domainMember.email,
      role: domainMember.role,
      createdAt: domainMember.createdAt.toISOString(),
    }),
  }
);
```

**Why**: External APIs return plain strings. Transformation schemas validate format before accepting into domain layer.

### Client Contract Schemas

Define client payload/response schemas with branded EntityIds:

```typescript
import * as S from "effect/Schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { formValuesAnnotation, $I } from "@beep/schema";

// REQUIRED - Client payload schema
export class CreateUserPayload extends S.Class<CreateUserPayload>($I`CreateUserPayload`)(
  {
    email: BS.EmailBase,
    organizationId: SharedEntityIds.OrganizationId,  // Branded ID
    role: S.Literal("admin", "member"),
  },
  formValuesAnnotation({
    email: "",
    organizationId: "",
    role: "member"
  })
) {}

// Response schema
export class CreateUserResponse extends S.Class<CreateUserResponse>($I`CreateUserResponse`)({
  userId: SharedEntityIds.UserId,  // Branded ID
  memberId: IamEntityIds.MemberId, // Branded ID
}) {}
```

**Pattern**: Use `S.Class` for client schemas, `formValuesAnnotation` for default values.

## Anti-Patterns

### 1. NEVER use lowercase constructors

```typescript
// FORBIDDEN - lowercase (old Effect API)
S.struct({ name: S.string })  // Wrong!
S.array(S.number)              // Wrong!

// REQUIRED - PascalCase (current API)
S.Struct({ name: S.String })
S.Array(S.Number)
```

### 2. NEVER use plain strings for entity IDs

```typescript
// FORBIDDEN
id: S.String
userId: S.String
organizationId: S.String

// REQUIRED
id: SharedEntityIds.UserId
userId: SharedEntityIds.UserId
organizationId: SharedEntityIds.OrganizationId
```

### 3. NEVER use type assertions with schemas

```typescript
// FORBIDDEN - Type casting bypasses validation
const userId = "" as SharedEntityIds.UserId.Type;

// REQUIRED - Use schema methods
const userId = SharedEntityIds.UserId.make(stringValue);  // Throws if invalid
const userId = SharedEntityIds.UserId.create();           // Generate new ID
```

### 4. NEVER use any or type assertions

```typescript
// FORBIDDEN - Bypassing type system
const data = externalData as User;
const id = unknownId as string;

// REQUIRED - Decode with schema
const data = yield* S.decode(UserSchema)(externalData);
const id = yield* S.decode(S.String)(unknownId);
```

### 5. NEVER mark server-generated tokens as sensitive

```typescript
// FORBIDDEN - Unnecessary overhead
sessionToken: BS.FieldSensitiveOptionOmittable(S.String)  // Server-generated, already protected

// REQUIRED - Use plain String for server tokens
sessionToken: S.String

// REQUIRED - Use sensitive for user credentials
password: BS.FieldSensitiveOptionOmittable(S.String)      // User-provided
apiKey: BS.FieldSensitiveOptionOmittable(S.String)        // User-provided
```

**Decision criteria**: Mark as sensitive if an attacker could use the value to impersonate a user or access protected resources.

## Related Modules

- [Effect.md](./Effect.md) - Using schemas with Effect error handling
- [Layer.md](./Layer.md) - Schema validation in service implementations
- [Context.md](./Context.md) - Schema-based service interfaces
- `.claude/rules/effect-patterns.md` - Complete schema patterns

## Source Reference

[.repos/effect/packages/effect/src/Schema.ts](../../.repos/effect/packages/effect/src/Schema.ts)
