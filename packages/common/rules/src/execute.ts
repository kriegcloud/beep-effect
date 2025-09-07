import { BS } from "@beep/schema";
import * as Arbitrary from "effect/Arbitrary";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as JSONSchema from "effect/JSONSchema";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { IsString, TypeOperator } from "./operators/domains/any";

const program = Effect.gen(function* () {
  const arb = Arbitrary.make(IsString);
  const mocked = FC.sample(arb, 10);
  const decoded = S.decode(S.Array(IsString))(mocked);

  yield* Console.log(JSON.stringify(decoded));
  const ast = IsString.ast.from;
  const identifierAnnotation = AST.getIdentifierAnnotation(ast);
  const titleAnnotation = AST.getTitleAnnotation(ast);
  const descriptionAnnotation = AST.getDescriptionAnnotation(ast);
  const symbolAnnotation = AST.getAnnotation(BS.SymbolAnnotationId)(ast);
  const jsonSchema = JSONSchema.make(TypeOperator);
  yield* Effect.all([
    Console.log(`IDENTIFIER: `, identifierAnnotation),
    Console.log(`TITLE: `, titleAnnotation),
    Console.log(`DESCRIPTION: `, descriptionAnnotation),
    Console.log(`SYMBOL: `, symbolAnnotation),
    Console.log(`JSON SCHEMA: `, JSON.stringify(jsonSchema, null, 2)),
  ]);
});

Effect.runPromise(program);
