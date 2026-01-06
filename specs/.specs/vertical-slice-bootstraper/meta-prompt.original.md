
I want you to create a prompt for another instance of Claude 4.5 Opus to orchestrate the research and implementation of a 
new cli command in the `@beep/repo-cli` package (tooling/cli/*). The goal of this command is to produce a new vertical slice see (packages/iam, packages/documents, packages/customization).
each vertical slice in this repo follows a very similar structure. Whenever I need to create a new one it is rather time consuming and requires a decent amount of boilerplate.

A vertical slice contains the following folders:
- client (`@beep/<slice-name>-client`) - contains the "glue-layer" between the backend and the frontend (colocates data-fetching, state management, etc.)
- domain (`@beep/<slice-name>-domain`) - contains the domain code (entities, values objects, etc.) for the vertical slice
- server (`@beep/<slice-name>-server`) - contains the backend code for the vertical slice
- tables (`@beep/<slice-name>-tables`) - contains the database schema and tables for the vertical slice
- ui (`@beep/<slice-name>-ui`) - contains the frontend code for the vertical slice

When creating a vertical slice there are a few inputs we will need.

1. vertical slice name. Should be lowercase and use kebab-case. 
2. vertical slice description. A short description of the vertical slice. 

Once these inputs are recieved the `packages/common/identity/src/packages` module must be updated to include the new vertical slice package names following the existing conventions. (the ts-morph library should be used to safely modify the file and subsequent files which require editing as opposed to creation) 


then the following files in the `packages/shared/domain` (`@beep/shared-domain`) need to be created:

#### entity-ids
1. create a folder called `<slice-name>` in `packages/shared/domain/src/entity-ids` with the following files:
- `ids.ts`
- `any-id.ts`
- `index.ts`
- `table-name.ts`

For file creation the `customization` slice should be used to generate handlebars templates for all files.

Since this is a boilerplating script only 1 entity id should be created with a placeholer name. For example:
```ts
import { $SharedDomainId } from "@beep/identity/packages";
import type * as S from "effect/Schema";
import { BS } from "@beep/schema";
const $I = $SharedDomainId.create("entity-ids/<slice-name>/ids"); // All Identity composers should be at the top of the files using it where the `.create` methods parameter is equivalent to the module path relative to the package.

export const PlaceholderId = BS.EntityId.make("placeholder", {
  brand: "PlaceholderId",
}).annotations(
  $I.annotations("PlaceholderId", {
    description: "A unique identifier for an Placeholder",
  })
);

export declare namespace PlaceholderId {
  export type Type = S.Schema.Type<typeof PlaceholderId>;
  export type Encoded = S.Schema.Encoded<typeof PlaceholderId>;
}
```

the placeholder will be used for naming in subsequent files.

see packages/shared/domain/src/entity-ids/customization for entity-id templates

Once the entity ids are created then these files must be updated:
- packages/shared/domain/src/entity-ids/any-entity-id.ts (Add the  new slice entry to the `AnyEntityId` schema using the `Uppercase<slice-name>` as the namespace import. (e.g `import * as Customization from "./customization";`))
- packages/shared/domain/src/entity-ids/entity-ids.ts (Add the namespace export following existing conventions.)
- packages/shared/domain/src/entity-ids/entity-kind.ts (Add the new slice entry to the `EntityKind` schema following existing conventions )

Once this is finished the vertical slice folder and packages can be created in the `packages/<slice-name>` folders. (use the customization slice to create handlebar templates for all files.)

Every package should have a test folder at it's root with a single `Dummy.test.ts` see (packages/customization/domain/test)

for the slices domain package a Placeholder entity folder and model files should be created:

1. packages/<slice-name>/domain/src/entities/Placeholder/Placeholder.model.ts
```ts
import { $<uppercase-slice-name>DomainId } from "@beep/identity/packages";
import { <uppercase-slice-name>EntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $<uppercase-slice-name>DomainId.create("entities/Placeholder");

/**
 * PlaceholderModel model representing user configured hotkeys.
 */
export class Model extends M.Class<Model>($I`PlaceholderModel`)(
  makeFields(<uppercase-slice-name>EntityIds.PlaceholderId, {
    placeholder: S.String,
  }),
  $I.annotations("PlaceholderModel", {
    description: "PlaceholderModel model representing a placeholder."
  })
) {
  static readonly utils = modelKit(Model);
}

```
packages/<slice-name>/domain/src/models/Placeholder/index.ts
```ts
export * from "./Placeholder.model";
```

packages/<slice-name>/domain/src/entities/index.ts
```ts
export * as Placeholder from "./Placeholder";
```

packages/<slice-name>/domain/src/index.ts
```ts
export * as Entities from "./entities";
```

Then in the packages/<slice-name>/tables package (`@beep/<slice-name>-tables`)
the following files must be created with placeholders

Project Path: packages/<slice-name>/tables/src

Source Tree:

```txt
src
├── _check.ts
├── index.ts
├── relations.ts
├── schema.ts
└── tables
    ├── index.ts
    └── placehodler.table.ts

```

`packages/<slice-name>/tables/src/index.ts`:

```ts
export * as <uppercase-slice-name>DbSchema from "./schema";

```

`packages/<slice-name>/tables/src/relations.ts`:

```ts
import * as d from "drizzle-orm";
import { placeholder } from "./tables";

export const placeholderRelations = d.relations(placeholder, () => ({}));
```

`packages/<slice-name>/tables/src/schema.ts`:

```ts
export * from "./relations";
export * from "./tables";

```

`packages/<slice-name>/tables/src/tables/index.ts`:

```ts
export * from "@beep/shared-tables/tables/organization.table";
export * from "@beep/shared-tables/tables/team.table";
export * from "@beep/shared-tables/tables/user.table";
export * from "./placeholder.table";

```

`tables/placeholder.table.ts`:

```ts
import { <uppercase-slice-name>EntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const userHotkey = Table.make(<uppercase-slice-name>EntityIds.PlaceholderId)(
  {
    placeholder: pg.text("placeholder").notNull(),
  },
);

```

Then in the slices server package (`@beep/<slice-name>-server`) the following files must be created with placeholders

Project Path: src

Source Tree:

```txt
packages/<slice-name>/server/src/
├── db
│   ├── Db
│   │   ├── Db.ts
│   │   └── index.ts
│   ├── index.ts
│   ├── repos
│   │   ├── Placeholder.repo.ts
│   │   ├── _common.ts
│   │   └── index.ts
│   └── repositories.ts
├── db.ts
└── index.ts

```

`packages/<slice-name>/server/src/db.ts`:

```ts
export * from "./db/index";

```

`packages/<slice-name>/server/src/db/Db/Db.ts`:

```ts
import * as DbSchema from "@beep/<slice-name>-tables/schema";
import { $<uppercase-slice-name>ServerId } from "@beep/identity/packages";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = $<uppercase-slice-name>ServerId.create("db/Db");

const serviceEffect: DbClient.PgClientServiceEffect<typeof DbSchema> = DbClient.make({
  schema: DbSchema,
});

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag($I`Db`)<Db, Shape>() {
}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> = Layer.scoped(Db, serviceEffect);

```

`packages/<slice-name>/server/src/db/Db/index.ts`:

```ts
export * as <uppercase-slice-name>Db from "./Db";

```

`packages/<slice-name>/server/src/db/index.ts`:

```ts
export * from "./Db";
export * from "./repos";
export * as <uppercase-slice-name>Repos from "./repositories";
```

`packages/<slice-name>/server/src/db/repos/Placeholder.repo.ts`:

```ts
import { Entities } from "@beep/<slice-name>-domain";
import { <uppercase-slice-name>Db } from "@beep/<slice-name>-server/db";
import { $CustomizationServerId } from "@beep/identity/packages";
import { <uppercase-slice-name>EntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CustomizationServerId.create("db/repos/PlaceholderRepo");

export class PlaceholderRepo extends Effect.Service<PlaceholderRepo>()($I`PlaceholderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* <uppercase-slice-name>Db.Db;

    return yield* DbRepo.make(<uppercase-slice-name>EntityIds.PlaceholderId, Entities.Placeholder.Model, Effect.succeed({}));
  }),
}) {}

```

`packages/<slice-name>/server/src/db/repos/_common.ts`:

```ts
import { <uppercase-slice-name>Db } from "@beep/<slice-name>-server/db";
export const dependencies = [<uppercase-slice-name>Db.layer] as const;

```

`packages/<slice-name>/server/src/db/repos/index.ts`:

```ts
export * from "./Placeholder.repo";

```

`packages/<slice-name>/server/src/db/repositories.ts`:

```ts
import type {<uppercase-slice-name>Db} from "@beep/<slice-name>-server/db";
import type {DbClient} from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos =
  | repos.PlaceholderRepo;

export type ReposLayer = Layer.Layer<
  Repos,
  never,
  DbClient.SliceDbRequirements | <uppercase-slice-name>Db.Db
>;

export const layer: ReposLayer = Layer.mergeAll(
  repos.PlaceholderRepo.Default
);

export * from "./repos";

```

`packages/<slice-name>/server/src/index.ts`:

```ts
export * from "./db";

```

The remaining packages can simply just be made with `src/index.ts` being empty see `customization` slice.


Then in the `runtime/server` package

these files must be modified safely using ts-morph
- packages/runtime/server/src/DataAccess.layer.ts (Add the slice member to the `SliceRepos` union type. Add the `<uppercase-slice-name>Repos.layer` element to the `sliceReposLayer` constant.)
- packages/runtime/server/src/Persistence.layer.ts ( Add the slice member to the `DbClients` union type. Add the `<uppercase-slice-name>Db.Db` element to the `sliceClientsLayer` constant.)


Finally in the packages/_internal/db-admin package the following updates must be made using the ts-morph library:
- packages/_internal/db-admin/src/slice-relations.ts (add the relations export from `@beep/<slice-name>-tables/relations`)
- packages/_internal/db-admin/src/tables.ts (add the tables export from `@beep/<slice-name>-tables/tables`)


Then at the root of the repository the following files must be updated / created

- create a new <slice-name>.json file in tsconfig.slices following existing slice json conventions
- update the root tsconfig.json to include the new slice json file references 
- update tsconfig.build.json reference with an new entry for the slice following existing slice conventions
- update tsconfig.base.jsonc with new path aliases for each package in the slice following existing slice conventions

The prompt should instruct the new instance of claude to use sub-agents to gather and create a todo list and gather other relevant 
information for `tsconfigs`, `package.json`, updates that will need to be made in dependendent packages.

This prompt should instruct the new instance of claude to

- Milestone 1. deploy parallel agents gather context and todos of what will need to be created & updated by the script as a todo list with checkboxes to the orchestrator can keep track of what has been completed
- Milestone 2. deploy parallel agents perform research and gather information on how the new cli command should be implemented using existing commands as reference, analyzing the `tooling/utils` package for existing useful utilities, research & gather documentation for ts-morph, handlebars and other relevant libraries (effect libs etc)
- Milestone 3. deploy parallel agents to create boilerplate & stubs for the new command (types, schemas, utilities & docstrings NO IMPLEMENTATION! code/stubs  which could error / server as boilerplate should be commented out). then build & typecheck sould be ran by the orchestrator to validate the boilerplate has been completed
- Milestone 4. deploy parallel agents to complete the full implementation cli command
- Milestone 5. deploy agents to create unit tests for the new command

Make sure the new instance knows it is acting as the orchestrator agent and should use sub-agents for all tasks to preserve its context as much as possible. Additionally make sure that each agent performing a "research related task" should produce a relevantly named markdown file including details about their findings in a markdown document inside specs/.specs/vertical-slice-bootstraper/research and that when agents have finished researching another agent should be used to synthesize all agent reports in to a master markdown document inside specs/.specs/vertical-slice-bootstraper/research-master.md

The orchestrator agent should only read the synthesized reports and run tests, build & typecheck.

When writing the prompt please use context & prompt engineering best practices.


