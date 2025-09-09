import * as Arbitrary from "effect/Arbitrary";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as JSONSchema from "effect/JSONSchema";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { IamEntityIds } from "./EntityIds";
import { UploadPath } from "./File/schemas/UploadPath";

const program = Effect.gen(function* () {
  // const i = yield* S.decode(UploadPath)({
  //   env: "dev",
  //   organizationType: "individual",
  //   organizationId: SharedEntityIds.OrganizationId.create(),
  //   entityKind: "user",
  //   entityIdentifier: IamEntityIds.UserId.create(),
  //   entityAttribute: "image",
  //   fileId: SharedEntityIds.FileId.create(),
  //   fileItemExtension: "png",
  // })
  const ie = yield* S.encode(UploadPath)(
    "/dev/tenants/58/individual/organization__c8dcb24d-b4c0-46cc-b437-1983ff73fbe4/user/user__45679f3b-812e-4941-a7f3-cd686a96f362/image/2025/09/file__edbf5c12-d164-44d1-ba31-8b25e4caf647.png"
  );

  const beep = yield* S.decode(UploadPath)(ie);

  yield* Console.log("IE", ie);
  yield* Console.log("BEEP: ", beep);
  // yield* Console.log(i);
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
