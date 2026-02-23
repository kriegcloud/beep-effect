# CODEBASE LAWS
- **NEVER tollerate Errors**: All automatic checks, code quality tools & scripts must pass before continuing work.
- **NEVER make assumptions about Effect modules or packages**: This project is written using Effect v4. when writing typescript always verify against [Effect v4 source code](.repos/effect-smol) or the `effect-v4` knowledge graph using the `graphiti-memory` tool.
- **NEVER use Native objects or their methods**: Effect has a Module for Array, Object, Date, String, Number, Boolean and more - the user will get mad at you if you use them.
- **NEVER use type assertions**: Unless you ask the user and they give you explicit permission.
- **NEVER use non-null assertions**: Always use safe code even in basic for loops.
- **NEVER return null or undefined**: Always use `effect/Option`. If a function returns `null` or `undefined` and it is not used in application entry points or interfacing with external libraries then `effect/Option` is a requirement. If you are doing null checks then you are doing something wrong.
- **NEVER use long if else chains & switch statements**: Always use `effect/Match`.
- **NEVER use try/catch blocks**: If code can throw an error then it should be an `Effect` and use `Effect.try` or `Effect.tryPromise` or wrapped in `effect/Result` `Result.try`.
- **NEVER use native Error object or non tagged Error**: Even in non Effect code you MUST define a dedicated `effect/Schema` `Schema.TaggedErrorClass` which is well annotated and expressive.
- **NEVER use `typeof` always use dedicated type guards**: Effect has type guards on many modules and a module dedicated to Predicates. ALWAYS use `effect/Predicate`.
- **NEVER have functions which return Effect.gen generators**: Effect has a dedicated `Effect.fn` helper for this. ALWAYS use it.
- **NEVER leave Schemas unannotated**: Always annotate `effect/Schema` schema's using the `.annotations` helper from `@beep/identity/Identity`.
- **NEVER use plain strings for identifiers on Schema classes or ServiceMap Service Tags**: In order to eliminate the potential for duplicate keys in `effect/Layer` layers the `@beep/identity` package's [IdentityComposer](./packages/common/identity/src/Identity.ts#L157-176) is a tagged template literal always make ServiceTags like this:
```ts
import { $PackageNameId } from "@beep/identity";
import { ServiceMap } from "effect/ServiceMap";
const $I = $PackageNameId.create("relative[73940c55-dc63-4e66-8fa2-47dbcfd06cca_ExportBlock-6e9f1b95-33d6-4902-bb61-bc8f1165809a](../../../Downloads/73940c55-dc63-4e66-8fa2-47dbcfd06cca_ExportBlock-6e9f1b95-33d6-4902-bb61-bc8f1165809a)/path/to/file");
export class Bm25Writer extends ServiceMap.Service<Bm25Writer, Bm25WriterShape>()(
  $I`Bm25Writer`
) {}
```
- **NEVER use `any` prefer `unknown` and type guards**



