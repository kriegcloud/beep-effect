import { StringOperators, Union } from "@beep/logos/internal/operator-types/Equals";
import { BS } from "@beep/schema";
import * as Arbitrary from "effect/Arbitrary";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as JSONSchema from "effect/JSONSchema";
import * as O from "effect/Option";
import * as AST from "effect/SchemaAST";

const program = Effect.gen(function* () {
  const arb = Arbitrary.make(StringOperators.StartsWith);
  const mocked = FC.sample(arb, 1);
  yield* Console.log(mocked);

  const ast = StringOperators.StartsWith.ast.from;

  const identifierAnnotation = AST.getAnnotation(AST.IdentifierAnnotationId)(ast);
  yield* Console.log(`Identifier Annotation: `, identifierAnnotation);
  const titleAnnotation = AST.getAnnotation(AST.TitleAnnotationId)(ast);
  yield* Console.log(`Title Annotation: `, titleAnnotation);
  const descriptionAnnotation = AST.getAnnotation(AST.DescriptionAnnotationId)(ast);
  yield* Console.log(`Description Annotation: `, descriptionAnnotation);
  const schemaIdAnnotation = AST.getAnnotation(AST.SchemaIdAnnotationId)(ast).pipe(O.getOrThrow);
  yield* Console.log(`SchemaId Annotation: `, String(schemaIdAnnotation));
  const symbolAnnotation = AST.getAnnotation(BS.SymbolAnnotationId)(ast).pipe(O.getOrThrow);
  yield* Console.log(`Symbol Annotation: `, String(symbolAnnotation));
  const examplesAnnotation = AST.getAnnotation(AST.ExamplesAnnotationId)(ast).pipe(O.getOrThrow);
  yield* Console.log(`Examples Annotation: `, examplesAnnotation);
  const jsonSchema = JSONSchema.make(Union);

  yield* Console.log("JSONSchema: ", JSON.stringify(jsonSchema, null, 2));
});

Effect.runFork(program);
