I've been working on a DSL system for attaching sql metadata to effect/Schema & @effect/sql/Model schemas such that type safe drizzle table definitions can be derived allowing for a drift free way to align Domain Entity Model schemas with their persisted representations at runtime. I've gone through multiple iterations of prompting
  sessions, proof of concepts, interface design and testing. I've arrived at something I like but it's not quite where I want it to be. One thing I've done in this repo unrelated to the DSL but related in principle to "domain -> persistence alignment" is create the bellow abstractions in an effort to reduce boilerplate and create alignment:
  - packages/shared/tables/src/Table/Table.ts (defines a drizzle table with default columns applied)
  - packages/shared/tables/src/OrgTable/OrgTable.ts (defineds a drizzle table with all defaults of the above `Table` abstraction but with `organizationId` added for multi tenancy purposes)
  - packages/shared/domain/src/common.ts (`makeFields` function used in the definition of domain `entities`)

  You can see example usage of these in:
  - OrgTable.make - packages/iam/tables/src/tables/member.table.ts
  - Table.make - packages/shared/tables/src/tables/organization.table.ts
  - makeFields - packages/shared/domain/src/entities/Organization/Organization.model.ts

  The afformentioned DSL code resides in
  - core module: packages/common/schema/src/integrations/sql/dsl
  - tests: packages/common/schema/test/integrations/sql/dsl


  One thing feature I would like to add to this "dsl" module is the ability to have a `ModelFactory` which allows you to create a custom "builder" which allows you to define Model schema instances but with default `Fields` already applied. For example:

  ```ts
  import { ModelBuilder, Field } from "@beep/schema/integrations/sql/dsl";
  import { BS } from "@beep/schema";
  import { DateTime } from "effect";
  const makeModel = ModelBuilder.create({
   defaultFields: {
     createdAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp", defaultFn: () => DateTime.toDateUtc(DateTime.unsafeNow()).toISOString() } }),
     updatedAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp", onUpdateFn: () => DateTime.toDateUtc(DateTime.unsafeNow()).toISOString() } }),
   },
   tableNameFn: (name) => `org__${name}` as const,
  });

  // now I can

  class Entity extends makeModel<Entity>("entity")(
    id: Field(S.String)({ column: { type: "uuid", primaryKey: true } })
  ) {}

  // now entity has fields already applied
  const createdAt = Entity.fields.createdAt
  const updatedAt = Entity.fields.updatedAt
  ```

  I want you to create a specification prompt to add this feature in .specs/dsl-model-builder/dsl-model-builder-prompt.original.md. The plan is for you to create a `.original.md` prompt and then use the `refine-prompt` skill/command on the `.original.md` prompt that you create. before creating the original prompt (pre refinement) I want you
  to deploy a cluster of explorer sub-agents in parallel to explore the `dsl` module in its current state. Each sub-agent should produce a report in a markdown file with the following naming format `<expored-module-part-name>.report.md` and place the file in .specs/dsl-model-builder/current-module-state-reports each agent should understand the intent of their exploration as it relates to the `ModelFactory` feature I want to add. Once all sub-agents have
  finished and the reports exist in .specs/dsl-model-builder/current-module-state-reports deploy another sub-agent to synthesize all reports into a new markdown document called `current-module-state-report.md` in .specs/dsl-model-builder. The next phase will involve researching the implementation of the `ModelFactory` feature I want to add specifically as it relates to `effect` idioms and modules which will be used to implement the feature their reports should be placed in .specs/dsl-model-builder/implementation-research with a naming convention that keeps things consistent. Once the implementation research sub-agents have finished producing their reports deploy another sub-agent to synthesize all reports into a new markdown document called `implementation-research-report.md` in .specs/dsl-model-builder. 
  Then you should read each of the synthesized reports and write the .specs/dsl-model-builder/dsl-model-builder-prompt.original.md prompt. Once written the `refine-prompt` skill/command should be used to refine the prompt. 