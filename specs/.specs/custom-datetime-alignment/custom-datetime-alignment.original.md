# Original Prompt: custom-datetime-alignment

In @packages/iam/server/src/adapters/repos/User.repo.ts I've created a simple demonstration of a problem I'm trying to
solve as it relates to the encoded type's of domain `@effect/sql/Model` schemas for
model fields/columns using the BS.DateTimeUtcFromAllAcceptable and corresponding drizzle table columns using
`pg.timestamp`. As seen by the type error here:

```ts
          //  property banExpires are incompatible.
          // Type 'string | number | Date | DateTime.UTC` is not assignable to type
          // pe number is not assignable to type
          // string | SQL<unknown> | Placeholder<string, any> | null | undefined
encodedPayload
```

The encoded type of BS.DateTimeUtcFromAllAcceptable does not align with the type that drizzle expects for a
`pg.timestamp` using string mode. To fix this I want to create a custom schema in
@packages/shared/tables/src/columns/custom-datetime.ts which functions more or less the same as the regular
`pg.timestamp` column from drizzle-orm but allows for any of the following types to be passed to
it `string | number | Date | DateTime.UTC`. To accomplish this we would create an effect/Schema transformOrFail schema
which takes the `S.encodedBoundSchema(BS.DateTimeUtcFromAllAcceptable)` and transforms
it into a iso string like so `F.pipe(dateTimeUtcFromAllAcceptableValue, DateTime.toDateUtc).toISOString()`. the
`import { customType } from "drizzle-orm/pg-core";` column would have a dataType of
`custom-datetime` and we would use `decodeSync` & `encodeSync` in the respective toDriver and fromDriver methods to
properly construct the custom drizzle schema column.

I want you to:
1. deploy effect-researcher subagents to research, design and implement the custom datetime alignment
2. deploy effect-researcher to complete the implementation
3. deploy several sub-agents in parallel to replace all usages of regular `pg.timestamp` with the custom datetime drizzle column type in
  - packages/shared/tables/src/tables
  - packages/iam/tables/src/tables
  - packages/documents/tables/src/tables
