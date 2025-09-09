import * as Arbitrary from "effect/Arbitrary";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as JSONSchema from "effect/JSONSchema";
import * as AST from "effect/SchemaAST";
import { IamEntityIds } from "./EntityIds";

const program = Effect.gen(function* () {
  const arb = Arbitrary.make(IamEntityIds.AccountId);
  const mocked = FC.sample(arb, 10);
  const ast = IamEntityIds.AccountId.ast;
  yield* Console.log(mocked);
  const schemaIdAnnotation = AST.getSchemaIdAnnotation(ast);
  yield* Console.log(schemaIdAnnotation);
  const identifierAnnotation = AST.getIdentifierAnnotation(ast);
  yield* Console.log("identifier: ", identifierAnnotation);
  const titleAnnotation = AST.getTitleAnnotation(ast);
  yield* Console.log("title: ", titleAnnotation);
  const descriptionAnnotation = AST.getDescriptionAnnotation(ast);
  yield* Console.log("description: ", descriptionAnnotation);
  const jsonSchema = JSONSchema.make(IamEntityIds.AccountId);
  yield* Console.log(JSON.stringify(jsonSchema, null, 2));
});

Effect.runPromise(program);
