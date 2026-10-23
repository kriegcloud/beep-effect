### What is the problem this feature would solve?

`Match` has record-form matchers for tagged unions (`valueTags`, `typeTags`, `tags`, `tagsExhaustive`), but none for a union of bare literals. For a union like `"draft" | "review" | "published"`, the options today are:

```ts
type Status = "draft" | "review" | "published"

// a `when` per member
const label = Match.type<Status>().pipe(
  Match.when("draft", () => "Draft"),
  Match.when("review", () => "In review"),
  Match.when("published", () => "Live"),
  Match.exhaustive
)

// or a plain record, which loses exhaustiveness checks against the union
const labels: Record<Status, () => string> = { draft: () => "Draft", review: () => "In review", published: () => "Live" }
```

Literal unions come up all the time with `Schema.Literals` and with string enums in external payloads. The `when` chain grows with the union and loses the one-key-per-member layout that makes a missing case easy to spot in review.

### What is the feature you are proposing to solve the problem?

`Match.literals` and `Match.literalsExhaustive`, the literal-union counterparts of `tags` and `tagsExhaustive`, keyed by the literal itself:

```ts
const label = Match.type<Status>().pipe(
  Match.literalsExhaustive({
    draft: () => "Draft",
    review: () => "In review",
    published: () => "Live"
  })
)

const isEditable = Match.type<Status>().pipe(
  Match.literals({ draft: () => true, review: () => true }),
  Match.orElse(() => false)
)
```

- **Types.** The handler record is keyed by `Extract<R, string | number>`, with numbers as their string keys like any object key. Each handler receives its own literal. Excess keys fail the same way they do for `tags`. `literals` adds the handled members to the matcher's filters, and `literalsExhaustive` requires every member, like `tagsExhaustive`.
- **Key collisions.** A union that contains both `1` and `"1"` maps both to the key `"1"`. The simplest rule is to reject such unions at the type level. Supporting `boolean` and `bigint` members would need an encoding, which this proposal leaves out.
- **Implementation.** The same shape as `discriminators`, keyed on the input instead of a field: `makeWhen((arg) => (typeof arg === "string" || typeof arg === "number") && Object.hasOwn(fields, arg), (data) => fields[data](data))`.
- **Tests and docs.** Alongside the `tags` tests, plus a `Match` docs example.

### What alternatives have you considered?

- **`Match.whenOr(...members, handler)`.** It groups several literals under one handler, and it composes well with a record dispatcher held elsewhere, but it does not give the per-member record.
- **Wrapping literals into `{ _tag }` objects to reuse `valueTags`.** That allocates on every match and changes the input type.
- **A plain `Record<Status, ...>` lookup.** Exhaustive at the declaration, but not a `Match` matcher, so it doesn't compose with `when`, `not` or `orElse`.

I'm happy to open a PR if the shape works for you.

Checked against `main` at 43e6a17 on 2026-10-22.
