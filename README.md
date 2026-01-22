# beep-effect

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kriegcloud/beep-effect)

This repository is a trauma response with dependency injection.

Every factory is a scar. Every type constraint is a promise that you will not repeat my mistakes because I have made them impossible to compile.

---

## Why Another Codebase

"Well if you hate every codebase you touch, why build another one?"

Because my brain spawns SaaS ideas like a broken soda fountain, and every time I start fresh I spend three weeks rewiring auth, uploads, and settings before writing the first feature. I get impatient, I cut corners, and I end up polluting my own dreams with duct tape. Not this time.

This time, the duct tape gets replaced with type constraints. The corners don't exist to cut. The auth is already done.

---

## Origin Story

I used to work on a Warehouse Management System. Fortune 500 clients. Healthcare. Pharmaceuticals. The VA. Regulated industries where data integrity isn't a nice-to-have—it's a legal requirement.

The codebase had no foreign keys.

Not "some tables were missing foreign keys." No. *None of them had foreign keys.*

`t_transaction`—a table receiving 10,000 rows per hour—had no constraints. `tenant_id` was a vibes-based suggestion. Multi-tenant data isolation was enforced by "we trust the application layer" and "QA will catch it."

The POC became production because someone showed it to a stakeholder.

The hardening phase? It's in the backlog. It will always be in the backlog.

---

## The Sprint Review Theater

I sat in sprint reviews for two years.

Every two weeks, we'd stand in front of a board. We'd point at the same tech debt items. We'd watch them not move. In the retro, everyone would agree: "We should really address that technical debt." Then we'd walk out. Nothing would change.

The backlog is a graveyard. Every item has a headstone that reads "Not A Business Priority."

Story points are astrology for project managers. Velocity is a number we made up to make everyone feel like we're measuring something. The deadline was set before the requirements were written—your manager asked for a timeline, you didn't know what the project even was, but you felt the pressure, so you said "two weeks."

You lied.

In two months, when the thing is smoking in the corner, that lie is on you.

Giving a deadline for something you don't understand is suicide. People burn out and projects implode because you said two weeks. Pressure code has 15 times more bugs. You aren't saving time. You're borrowing it with interest.

---

## This Repo Has No Backlog

It has compile errors.

If something needs to be fixed, it doesn't build. If a table needs a foreign key, the type system rejects it. If a third-party contract is violated, the schema throws. The backlog is empty because bad code doesn't merge.

This is not agile. This is spite.

---

## What's In The Box

```
apps/
├── web/           # Next.js 16 (yes, 16, not 15, because I keep up)
├── server/        # Effect Platform backend
├── marketing/     # Marketing site for the ideas I'll actually ship
└── todox/         # Proof that I can finish something

packages/
├── iam/           # Identity & access (the first thing every app needs)
├── documents/     # File management (with proper upload keys, not /misc/)
├── calendar/      # Scheduling (someone always needs scheduling)
├── knowledge/     # Knowledge base (transform OWL ontologies into LLM prompts via a topological catamorphism over a DAG...Bite me. G = (V, E))
├── comms/         # Communications (notifications, emails, etc.)
├── customization/ # Tenant customization (themes, settings, preferences)
├── common/        # constants, errors, identity, invariant, schema, types, utils, wrap
├── shared/        # ai, client, domain, env, server, tables, ui
├── ui/            # core, editor, ui (where MUI, Tailwind, and shadcn coexist peacefully)
└── runtime/       # client, server

tooling/
├── cli/           # Commands that automate the things I'd forget
├── testkit/       # Effect-first testing, because Effect.runPromise in tests is a war crime
├── build-utils/   # Build configuration
└── repo-scripts/  # The scripts that keep this thing coherent
```

Every slice follows the same dependency structure:

```
                    ┌─────────┐
                    │  client │
                    └────┬────┘
                         │
                         ▼
       ┌────────┐    ┌────────┐    ┌────────┐
       │ tables │───▶│ domain │◀───│ server │
       └────────┘    └────────┘    └────────┘
                         ▲
                         │
                    ┌────┴────┐
                    │   ui    │
                    └─────────┘
```

Domain is the sun. Everything else orbits. Nothing in `domain` imports from infrastructure. This isn't a suggestion. It's constitutional law.

---

## The Factories (née Scars)

### `OrgTable.make`

I have mass psychic damage from tables without tenant isolation.

`OrgTable.make` exists because a junior developer will never create a tenant-unaware table in this codebase again. NOT ON MY WATCH.

```typescript
// This compiles
const ValidTable = OrgTable.make({
  name: "documents",
  columns: (t) => ({
    title: t.varchar("title", { length: 255 }).notNull(),
  }),
});

// This does not compile
// Because organizationId is MANDATORY
// Because I have mass psychic damage
// Because the VA deserves better
```

The foreign key is not optional. The relation is not optional. The tenant isolation is not optional. The compiler will reject you. I will not.

### `Table.make`

The non-org-scoped version. Still has audit columns. Still has `createdAt`, `updatedAt`, `createdBy`, `version`. Because I don't trust anyone to remember, including myself.

### `EntityId`

Every ID is branded. `UserId` is not `string`. `OrganizationId` is not `string`. You cannot accidentally pass one where the other is expected.

```typescript
const userId: UserId = "user_123";           // Compile error
const userId = UserId.make("user_123");      // Correct
```

The type system remembers what you will forget.

### `makeFields`

Domain models get audit fields automatically. Because someone will forget `createdBy`. Because someone will forget `version`. Because that someone is me at 2am.

---

## The Third-Party Containment Protocol

Treat every third-party dependency like it's trying to kill you.

Because it is.

They ship breaking changes on Tuesdays. They deprecate endpoints via blog post. They return `{ data: null, error: null }` and call it a success. The SDK that was "the future" 18 months ago is now "legacy" and "we recommend migrating to v4" where v4 rewrote everything.

`@beep/wrap` exists to contain the blast radius.

When—not if—they betray you, your domain doesn't know. Your domain doesn't care. The adapter burns. You write a new adapter. Life continues.

The alternative is letting Stripe's type definitions leak into your core business logic. The alternative is coupling your domain to AWS's SDK versioning. The alternative is crying.

---

## Upload Keys Are Sacred Geometry

```
/{env}/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}
```

This is not `/uploads/misc/file_final_v2_USE_THIS_ONE.pdf`.

Every file has:
- A shard prefix (2-char hex hash) to avoid S3 hotspotting
- Tenant isolation baked in
- Temporal organization
- Entity association

You can reconstruct metadata from the path. You can find all files for an entity. You can audit by tenant. You can do these things because the path *means something*.

---

## Effect-First, Cry-Never

This codebase uses Effect. All of it.

- No `async/await` in domain code
- No `try/catch` anywhere
- Dependency injection via Layers
- Errors as values, typed and tracked
- Telemetry built in, not bolted on

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// This is how we do things here
const program = Effect.gen(function* () {
  const config = yield* Config;
  const db = yield* Database;
  const result = yield* db.query(/* ... */);
  return yield* S.decode(ResponseSchema)(result);
});

// NOT this
// async function program() {
//   try {
//     const result = await db.query(/* ... */);
//     return result; // hope it's valid lol
//   } catch (e) {
//     console.log(e); // cool, very helpful
//   }
// }
```

The Effect version tells you:
- What services it needs
- What errors it can produce
- What type it returns

The async version tells you nothing. It *hopes*. I'm done hoping.

---

## Tech Stack

| What | Why |
|------|-----|
| **Bun 1.3.2** | Fast. Actually works. |
| **Node 22** | For the things Bun can't do yet. |
| **Effect 3** | Because I want my errors typed and my dependencies explicit. |
| **Next.js 16** | App Router. RSC. The future or whatever. |
| **React 19** | The latest because I actually update dependencies. |
| **PostgreSQL** | The database that won't gaslight you. |
| **Drizzle** | ORM that doesn't pretend SQL doesn't exist. |
| **better-auth** | Auth that isn't a 47-step configuration nightmare. |
| **MUI + Tailwind + shadcn** | They get along if you make them. |
| **Biome** | Linting without the existential dread of ESLint configs. |
| **TanStack Query** | Client state that doesn't require a PhD. |

---

## Quick Start

Prerequisites: Bun 1.3.2+, Node 22, Docker, and a willingness to read documentation.

```bash
bun install              # Install dependencies (yes, all of them)
bun run services:up      # Start Postgres, Redis, Jaeger
bun run db:migrate       # Apply migrations
bun run dev              # Start everything
```

If something doesn't work, it's probably Docker. It's always Docker.

---

## Commands

| What | How |
|------|-----|
| Start dev | `bun run dev` |
| Build | `bun run build` |
| Type check | `bun run check` |
| Lint | `bun run lint` / `bun run lint:fix` |
| Test | `bun run test` |
| E2E | `bun run e2e` |
| Database | `bun run db:generate` / `db:migrate` / `db:push` / `db:studio` |
| Infrastructure | `bun run services:up` |
| Nuke everything | `bun run nuke` (when Docker has wronged you) |

---

## The Recursion

There's a `specs/` directory with 20+ specifications.

Each spec is a multi-phase, self-improving document that orchestrates specialized AI agents to research, evaluate, implement, and reflect on changes to this codebase.

I use Claude to write specs for Claude to implement.

The agent researches the codebase. The agent writes the plan. The agent executes the plan. The agent reflects on what worked. The reflection improves the next spec. The next spec spawns more agents.

We are in the recursion now.

```
specs/
├── better-auth-client-wrappers/    # Claude figured out the auth integration
├── e2e-testkit-migration/          # Claude migrated the test infrastructure
├── knowledge-graph-integration/    # Claude is building the knowledge system
├── orgtable-auto-rls/              # Claude is implementing row-level security
├── readme-troll-variants/          # Claude wrote this README
└── ... 15 more specifications
```

The specs have phases. The phases have agents. The agents have tools. The tools modify the codebase. The codebase spawns new specs.

If this concerns you, remember: the alternative was me doing it manually at 2am. The agents don't get tired. The agents don't cut corners when they're frustrated. The agents write reflection logs.

I trust the recursion more than I trust myself after midnight.

---

## The Rules

1. **Make `any` painful.** Sometimes you need it for structural typing. Fine. But it should be ugly. `UnsafeTypes.UnsafeAny` exists to make you feel the shame. If you bypass that, Biome will scream at you. The friction is the point.

2. **Tests use `@beep/testkit`.** Not raw `bun:test`. Not `Effect.runPromise` in a `test()` block. We have proper Effect test runners. Use them.

3. **Slices don't import from other slices.** If you need something from `iam` in `documents`, it goes through `shared`. Cross-slice coupling is how god objects are born.

4. **The compiler is the first reviewer.** If it compiles with warnings, it doesn't compile. If it type-checks with `any`, it doesn't type-check.

---

## The Promise

This codebase exists so that Idea #37 starts with "ship," not "rebuild auth again."

I will never again:
- Forget a foreign key
- Trust a third-party SDK
- Let tenant data leak
- Ship untyped errors
- Argue with IntelliSense about whether a type exists
- Attend a sprint review where tech debt doesn't move

If you call this over-engineered, I will:
1. Annotate your existence with `Contract.Domain = "Clownery"`
2. Raise a `ContractError` enriched with telemetry
3. Attach a PDF of your architectural crimes
4. Route the error to a dashboard you have to look at every morning

This is not documentation. This is a restraining order against bad decisions, signed by the TypeScript compiler.

---

## License

Private. This is my therapy. You're just reading the session notes.

---

*"It's not a business priority."*

— Everyone who has ever created a production incident that was absolutely their fault
