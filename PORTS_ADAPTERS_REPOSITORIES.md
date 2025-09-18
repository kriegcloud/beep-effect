# Ports, Adapters, and Repositories in Beep (Effect-first, Vertical Slice)

This guide explains where Ports, Adapters, and Repositories live in your vertical slice architecture, and demonstrates them with a concrete IAM example: creating a personal organization for a new user and building the session’s active-organization context.

It aligns with your rules in `.windsurfrules` and the layering proposal in `layer-proposal.md` (single ManagedRuntime, `IamDb.layerWithoutDeps`, no upward deps, domain purity).

References to Effect docs used while drafting this guide:
- Context.Tag (service identifier): https://effect-ts.github.io/effect/docs/context/tag
- Effect.Service (define service + generated layers): https://effect-ts.github.io/effect/docs/requirements-management/layers/#simplifying-service-definitions-with-effectservice
- Managing Layers (avoid requirement leakage): https://effect-ts.github.io/effect/docs/requirements-management/layers/
- Managing Services: https://effect-ts.github.io/effect/docs/requirements-management/services/
- @effect/sql Model and makeRepository: https://effect-ts.github.io/effect/sql/Model.ts.html


## TL;DR
- Domain remains pure. Keep entities, value objects, domain services (pure functions), and policies in `S/domain`.
- Define Ports (interfaces) in `S/application`. A Port is a `Context.Tag` (or a Tag produced by `Effect.Service` when you want accessors) that declares operations your use cases need.
- Implement Adapters in `S/infra`. An Adapter satisfies one or more application Ports using concrete tech (Drizzle/@effect/sql, Stripe, Resend, etc.). Use `IamDb.layerWithoutDeps` so the app runtime owns DB provisioning.
- “Repositories” are just persistence adapters that implement repository ports. In tests, provide a fake implementation of the port.
- Use cases live in `S/application` and orchestrate ports. UI/HTTP handlers (apps/*) depend only on use cases.


## Where each concept belongs
- Domain (pure):
  - Example paths: `packages/iam/domain/src/*`
  - Contents: `Organization` model, `Member` model, `OrgProvisioning` (pure helper to compute slugs, defaults), policies, domain events.
- Application (ports + use cases):
  - Example paths: `packages/iam/services/src/ports/*`, `packages/iam/services/src/usecases/*`
  - Contents: `OrganizationRepoPort`, `MemberRepoPort`, `OrganizationReadModelPort`, and use cases: `ProvisionPersonalOrg`, `BuildSessionOrgContext`.
- Infrastructure (adapters):
  - Example paths: `packages/iam/infra/src/adapters/db/*`
  - Contents: `DrizzleOrganizationRepoAdapter`, `DrizzleMemberRepoAdapter`, `DrizzleOrganizationReadModelAdapter` that implement the ports using `IamDb.IamDb` and Drizzle (@effect/sql-drizzle integration).


## Why not repositories in the domain?
Keeping domain pure avoids leaking tech choices (SQL, Drizzle, HTTP) into the heart of your model. Effect’s own guidance is to avoid requirement leakage in service interfaces and build concrete dependencies in Layers. Define a port in application and implement it in infra.

If you currently have repositories defined in domain using `@effect/sql/Model.makeRepository` (e.g., `packages/iam/domain/src/Member/Member.repo.ts`), treat them as transitional. Move the interface to application and the implementation to infra (or keep Model-based repositories in infra and re-export them as adapters that satisfy the application port).


## Concrete example: personal org creation and session org context
The Better Auth adapter at `packages/iam/infra/src/adapters/better-auth/Auth.service.ts` currently does DB work inline in two hooks:
- After user creation: create a personal organization + membership
- Before session creation: compute `activeOrganizationId` and `organizationContext`

We’ll factor these into:
- A pure domain helper for computing slug and default values
- Application ports for organization and member persistence, and for a read-model query
- Infra adapters using `IamDb.IamDb`
- Application use cases orchestrating the ports
- Wiring these use cases into the Better Auth hooks

The code snippets below show the shape, file placement, and relationships. They are illustrative and align with your current types.


### 1) Domain: pure helper
File: `packages/iam/domain/src/services/OrgProvisioning.service.ts`

```ts
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids/iam";
import * as Organization from "@beep/shared-domain/Organization";
import * as S from "effect/Schema";

/** Input from the auth layer about the user we just created */
export interface NewUserInput {
  id: S.Schema.Type<typeof IamEntityIds.UserId>;
  name?: string | null;
}

/** Derived inserts and identifiers for personal org provisioning */
export interface PersonalOrgPlan {
  organizationId: S.Schema.Type<typeof SharedEntityIds.OrganizationId>;
  memberId: S.Schema.Type<typeof IamEntityIds.MemberId>;
  slug: string;
  organizationInsert: Organization.Model.insert.Type;
  memberInsert: {
    // simplified; use your Member.Model.insert.Type if available
    id: S.Schema.Type<typeof IamEntityIds.MemberId>;
    userId: S.Schema.Type<typeof IamEntityIds.UserId>;
    organizationId: S.Schema.Type<typeof SharedEntityIds.OrganizationId>;
    role: "owner" | "admin" | "member";
    status: "active" | "invited";
    joinedAt: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const OrgProvisioning = {
  makePersonal: (user: NewUserInput): PersonalOrgPlan => {
    const organizationId = SharedEntityIds.OrganizationId.create();
    const memberId = IamEntityIds.MemberId.create();
    const base = (user.name ?? "user").toLowerCase().replace(/\s+/g, "-");
    const slug = `${base}-${String(user.id).slice(-6)}`;
    const now = new Date();

    const organizationInsert: Organization.Model.insert.Type = {
      id: organizationId,
      name: `${user.name ?? "User"}'s Organization`,
      slug,
      type: Organization.OrganizationType.Enum.individual,
      ownerUserId: user.id,
      isPersonal: true,
      subscriptionTier: Organization.SubscriptionTier.Enum.free,
      subscriptionStatus: Organization.SubscriptionStatus.Enum.active,
      createdBy: String(user.id),
      source: "auto_created",
      createdAt: now,
      updatedAt: now,
    } as const;

    const memberInsert = {
      id: memberId,
      userId: user.id,
      organizationId,
      role: "owner" as const,
      status: "active" as const,
      joinedAt: now,
      createdBy: String(user.id),
      createdAt: now,
      updatedAt: now,
    };

    return { organizationId, memberId, slug, organizationInsert, memberInsert };
  },
};
```

- Pure helper. No DB/IO. Imports only domain types and schemas.


### 2) Application: Ports (interfaces)
Files: `packages/iam/services/src/ports/OrganizationRepo.port.ts`, `packages/iam/services/src/ports/MemberRepo.port.ts`, `packages/iam/services/src/ports/OrganizationReadModel.port.ts`

```ts
// packages/iam/services/src/ports/OrganizationRepo.port.ts
import * as Context from "effect/Context";
import * as Organization from "@beep/shared-domain/Organization";
import * as S from "effect/Schema";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";

export class OrganizationRepoPort extends Context.Tag("iam/services/OrganizationRepoPort")<
  OrganizationRepoPort,
  {
    insert: (
      input: Organization.Model.insert.Type
    ) => import("effect/Effect").Effect<
      S.Schema.Type<typeof SharedEntityIds.OrganizationId>,
      unknown,
      never
    >;
  }
>() {}
```

```ts
// packages/iam/services/src/ports/MemberRepo.port.ts
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import { IamEntityIds } from "@beep/shared-domain/entity-ids/iam";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";

export interface MemberInsert {
  id: S.Schema.Type<typeof IamEntityIds.MemberId>;
  userId: S.Schema.Type<typeof IamEntityIds.UserId>;
  organizationId: S.Schema.Type<typeof SharedEntityIds.OrganizationId>;
  role: "owner" | "admin" | "member";
  status: "active" | "invited";
  joinedAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MemberRepoPort extends Context.Tag("iam/services/MemberRepoPort")<
  MemberRepoPort,
  {
    insert: (
      input: MemberInsert
    ) => import("effect/Effect").Effect<
      S.Schema.Type<typeof IamEntityIds.MemberId>,
      unknown,
      never
    >;
  }
>() {}
```

```ts
// packages/iam/services/src/ports/OrganizationReadModel.port.ts
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import { IamEntityIds } from "@beep/shared-domain/entity-ids/iam";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";

export interface UserOrgRow {
  orgId: S.Schema.Type<typeof SharedEntityIds.OrganizationId>;
  orgName: string;
  orgType: string;
  isPersonal: boolean;
  subscriptionTier: string;
  role: string;
  memberStatus: string;
}

export class OrganizationReadModelPort extends Context.Tag("iam/services/OrganizationReadModelPort")<
  OrganizationReadModelPort,
  {
    listActiveForUser: (
      userId: S.Schema.Type<typeof IamEntityIds.UserId>
    ) => import("effect/Effect").Effect<ReadonlyArray<UserOrgRow>, unknown, never>;
  }
>() {}
```

- Ports are small interfaces. They do not mention `IamDb` or Drizzle.
- We’re using `Context.Tag` because we want thin, interface-only contracts.


### 3) Infrastructure: Adapters implementing the ports
Files: `packages/iam/infra/src/adapters/db/OrganizationRepo.drizzle.ts`, `packages/iam/infra/src/adapters/db/MemberRepo.drizzle.ts`, `packages/iam/infra/src/adapters/db/OrganizationReadModel.drizzle.ts`

```ts
// packages/iam/infra/src/adapters/db/OrganizationRepo.drizzle.ts
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { OrganizationRepoPort } from "@beep/iam-services/ports/OrganizationRepo.port";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const OrganizationRepoLive = Layer.effect(
  OrganizationRepoPort,
  Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;
    return {
      insert: (input) =>
        Effect.tryPromise({
          try: async () => {
            await db.insert(IamDbSchema.organizationTable).values(input);
            return input.id; // return the id we inserted
          },
          catch: (e) => e,
        }),
    } satisfies OrganizationRepoPort.Service;
  })
);
```

```ts
// packages/iam/infra/src/adapters/db/MemberRepo.drizzle.ts
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { MemberRepoPort } from "@beep/iam-services/ports/MemberRepo.port";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const MemberRepoLive = Layer.effect(
  MemberRepoPort,
  Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;
    return {
      insert: (input) =>
        Effect.tryPromise({
          try: async () => {
            await db.insert(IamDbSchema.memberTable).values(input);
            return input.id;
          },
          catch: (e) => e,
        }),
    } satisfies MemberRepoPort.Service;
  })
);
```

```ts
// packages/iam/infra/src/adapters/db/OrganizationReadModel.drizzle.ts
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { OrganizationReadModelPort } from "@beep/iam-services/ports/OrganizationReadModel.port";
import * as d from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const OrganizationReadModelLive = Layer.effect(
  OrganizationReadModelPort,
  Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;
    return {
      listActiveForUser: (userId) =>
        Effect.tryPromise({
          try: async () =>
            db
              .select({
                orgId: IamDbSchema.organizationTable.id,
                orgName: IamDbSchema.organizationTable.name,
                orgType: IamDbSchema.organizationTable.type,
                isPersonal: IamDbSchema.organizationTable.isPersonal,
                subscriptionTier: IamDbSchema.organizationTable.subscriptionTier,
                role: IamDbSchema.memberTable.role,
                memberStatus: IamDbSchema.memberTable.status,
              })
              .from(IamDbSchema.memberTable)
              .innerJoin(
                IamDbSchema.organizationTable,
                d.eq(IamDbSchema.memberTable.organizationId, IamDbSchema.organizationTable.id)
              )
              .where(
                d.and(d.eq(IamDbSchema.memberTable.userId, userId), d.eq(IamDbSchema.memberTable.status, "active"))
              )
              .orderBy(d.desc(IamDbSchema.organizationTable.isPersonal)),
          catch: (e) => e,
        }),
    } satisfies OrganizationReadModelPort.Service;
  })
);
```

- Each adapter is a simple `Layer.effect` that provides the application Port tag. We depend on `IamDb.IamDb` via the layer graph (compose with `IamDb.layerWithoutDeps` in the app runtime).
- If you prefer `@effect/sql/Model.makeRepository`, implement that inside infra and present a facade that conforms to the port shape.


### 4) Application: Use cases orchestrating the ports
Files: `packages/iam/services/src/usecases/ProvisionPersonalOrg.ts`, `packages/iam/services/src/usecases/BuildSessionOrgContext.ts`

```ts
// packages/iam/services/src/usecases/ProvisionPersonalOrg.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { OrgProvisioning } from "@beep/iam-domain/services/OrgProvisioning.service";
import { OrganizationRepoPort } from "@beep/iam-services/ports/OrganizationRepo.port";
import { MemberRepoPort } from "@beep/iam-services/ports/MemberRepo.port";
import { IamEntityIds } from "@beep/shared-domain/entity-ids/iam";

export interface ProvisionPersonalOrgInput {
  userId: S.Schema.Type<typeof IamEntityIds.UserId>;
  name?: string | null;
}

export const ProvisionPersonalOrg = {
  run: (input: ProvisionPersonalOrgInput) =>
    Effect.gen(function* () {
      const orgRepo = yield* OrganizationRepoPort;
      const memberRepo = yield* MemberRepoPort;
      const plan = OrgProvisioning.makePersonal({ id: input.userId, name: input.name });
      yield* orgRepo.insert(plan.organizationInsert);
      yield* memberRepo.insert(plan.memberInsert);
      return plan.organizationId;
    }),
} as const;
```

```ts
// packages/iam/services/src/usecases/BuildSessionOrgContext.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { OrganizationReadModelPort } from "@beep/iam-services/ports/OrganizationReadModel.port";
import { IamEntityIds } from "@beep/shared-domain/entity-ids/iam";

export const BuildSessionOrgContext = {
  run: (userId: S.Schema.Type<typeof IamEntityIds.UserId>) =>
    Effect.gen(function* () {
      const readModel = yield* OrganizationReadModelPort;
      const userOrgs = yield* readModel.listActiveForUser(userId);
      const activeOrgId = userOrgs[0]?.orgId;
      const organizationContext = userOrgs.reduce<Record<string, unknown>>((acc, org) => {
        acc[String(org.orgId)] = {
          name: org.orgName,
          type: org.orgType,
          role: org.role,
          isPersonal: org.isPersonal,
          subscriptionTier: org.subscriptionTier,
        };
        return acc;
      }, {});
      return { activeOrgId, organizationContext } as const;
    }),
} as const;
```

- Use cases depend only on ports and domain helpers.
- Tests can provide in-memory implementations for the ports.


### 5) Wiring in the Better Auth adapter
File: `packages/iam/infra/src/adapters/better-auth/Auth.service.ts`

Replace inline DB logic with calls to the use cases. Example shape (pseudocode-level wiring):

```ts
import { BuildSessionOrgContext } from "@beep/iam-services/usecases/BuildSessionOrgContext";
import { ProvisionPersonalOrg } from "@beep/iam-services/usecases/ProvisionPersonalOrg";
import { OrganizationRepoLive } from "@beep/iam-infra/adapters/db/OrganizationRepo.drizzle";
import { MemberRepoLive } from "@beep/iam-infra/adapters/db/MemberRepo.drizzle";
import { OrganizationReadModelLive } from "@beep/iam-infra/adapters/db/OrganizationReadModel.drizzle";

// ... inside your Effect-based construction of Auth options/service ...

// Provide the adapters for the ports when running these effects:
// Provision personal org after user creation
await Effect.runPromise(
  ProvisionPersonalOrg.run({
    userId: S.decodeUnknownSync(IamEntityIds.UserId)(user.id),
    name: user.name,
  }).pipe(Effect.provide(OrganizationRepoLive), Effect.provide(MemberRepoLive))
);

// Build session org context before session creation
const { activeOrgId, organizationContext } = await Effect.runPromise(
  BuildSessionOrgContext.run(S.decodeUnknownSync(IamEntityIds.UserId)(session.userId)).pipe(
    Effect.provide(OrganizationReadModelLive)
  )
);

return {
  data: {
    ...session,
    activeOrganizationId: activeOrgId,
    organizationContext: JSON.stringify(organizationContext),
  },
};
```

- The adapter provides its own dependencies via `IamDb.layerWithoutDeps`; your App runtime composes DB layers once (per `layer-proposal.md`).
- You can also compose these layers higher (e.g., in your managed runtime) and have the Better Auth adapter only consume the use cases.


## Relationship recap
- Port = interface in `S/application` declaring capabilities required by use cases. Implemented by infra. Test-friendly.
- Adapter = concrete implementation in `S/infra` that satisfies a port using tech (Drizzle, @effect/sql, Redis, etc.). Built as `Effect.Service` with `Default`/`DefaultWithoutDependencies` layers.
- Repository = a kind of adapter for persistence. Avoid placing in domain; either implement with Drizzle (as above) or with `@effect/sql/Model.makeRepository` inside infra.
- Use Case (application service) = orchestrates ports and pure domain logic to implement business processes.


## Migration notes for existing repos
- Files like `packages/iam/domain/src/Member/Member.repo.ts` and `packages/shared/domain/src/Organization/Organization.repo.ts` currently use `M.makeRepository` in domain. Suggested path:
  1) Move the interface to `packages/iam/services/src/ports/*` (or `packages/shared/application` for truly cross-cutting repos).
  2) Move the implementation to `packages/iam/infra/src/adapters/db/*`.
  3) Re-export `Default` and `DefaultWithoutDependencies` layers for easy wiring.
  4) Update app runtime to provide adapter layers once.

This keeps domain Node-free (as per your production posture and shared kernel constraints) and aligns with vertical slice boundaries.


## Testing strategy
- In unit tests for application use cases, provide fake/in-memory implementations for ports:

```ts
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import { OrganizationRepoPort } from "@beep/iam-services/ports/OrganizationRepo.port";

const TestOrganizationRepo = Context.add(
  Context.empty(),
  OrganizationRepoPort,
  { insert: () => Effect.succeed("org_123" as any) }
);

// then Effect.provide(program, TestOrganizationRepo)
```

- Swap adapters in integration tests by providing `OrganizationRepoLive`, etc.


## Why `Layer.effect` for adapters?
- The simplest and clearest way to implement an application Port is to provide the Port tag with a `Layer.effect` that builds the concrete implementation using your infra deps (`IamDb.IamDb`, Redis, etc.).
- If you want accessor generation or multiple implementations behind a single module, you can wrap an adapter in `Effect.Service` and then expose a layer that provides the Port tag. However, favor directly providing the Port tag unless you need those extras.

Note: Use cases are best authored as plain Effect functions (as shown) to avoid introducing extra service layers unless you specifically want to make them pluggable as services.


## Appendix: Map to the original Auth.service.ts code
- After user create, we call the `ProvisionPersonalOrg` use case instead of issuing `db.insert` statements directly.
- Before session create, we call `BuildSessionOrgContext` to produce `{ activeOrgId, organizationContext }` instead of querying inline.
- The concrete SQL from the original code lives in `DrizzleOrganizationReadModelAdapter`, keeping the adapter the only place where Drizzle/SQL occurs.

This decouples Better Auth from your database while keeping IAM’s domain pure and your application layer in control via ports and use cases.
