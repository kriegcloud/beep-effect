In @packages/common/lexical-schemas/src/nodes/plugins/index.ts I've imported the $LexicalSchemasId identity composer from `@beep/packages/identity`. The composer has a schema annotation utility you can see example usage in the ListTagType. The
  `.annotations` utility automatically creates the `schemaId`, `identifier` & title annotations for use provided the module path specified in the `.create` function of `$I` & the first argument to `.annotations`. The second argument allows us to define
  any other schema annotation. Every schema in `@beep/lexical-schemas` should be updated to use this patterns. So you will need to define a `$I` constant for each file containing schemas. then update all schema annotations to use `$I.annotations`
  utility to define their schema annotations. Additionally each schema needs to have the following annotations created.

  - `examples` annotation
  - `documentation` annotation
  - `description` annotation
  - `arbitrary` annotation
  - `equivalence` annotation
  - `pretty` annotation
  - `parseIssueTitle` annotation
  - `message` annotation

  I recommend you create some annotation utilities in `@beep/lexical-schemas/annotation-utils.ts` to streamline this process. First you should compile a todo list of each schema which needs to be updated with subchecklists for each schema annotation
  property keeping not of areas where annotation-utils could be useful to reduce boilerplate. Once the checklist is compiled you should create the annotation utilities. Then finally create a prompt you can give a team of sub-agents to actually
  implement the annotation changes for each file following prompt & context engineering best practices. deploy the agents in parallel for optimal efficiency
