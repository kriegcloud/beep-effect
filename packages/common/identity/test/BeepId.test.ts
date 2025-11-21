import { describe, expect, expectTypeOf, it } from "bun:test";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { BeepId } from "../src/BeepId";
import type { IdentityComposer, IdentityString, Segment } from "../src/types";

describe("BeepId", () => {
  it("composes schema identifiers", () => {
    const schemaId = BeepId.package("schema");
    const annotationsId = schemaId.compose("annotations");
    const payloadId = annotationsId.make("PasskeyAddPayload");

    expect(schemaId.string()).toBe("@beep/schema" as IdentityString<"@beep/schema">);

    expect(payloadId).toBe(
      "@beep/schema/annotations/PasskeyAddPayload" as IdentityString<"@beep/schema/annotations/PasskeyAddPayload">
    );
    expectTypeOf(schemaId.value).toMatchTypeOf<IdentityString<"@beep/schema">>();
    expectTypeOf(payloadId).toMatchTypeOf<IdentityString<"@beep/schema/annotations/PasskeyAddPayload">>();
  });

  it("builds multi-segment namespaces", () => {
    const repoNamespace = BeepId.package("iam-infra", "adapters", "repos");
    const userRepo = repoNamespace.make("UserRepo");

    expect(userRepo).toBe(
      "@beep/iam-infra/adapters/repos/UserRepo" as IdentityString<"@beep/iam-infra/adapters/repos/UserRepo">
    );
    expectTypeOf(repoNamespace.value).toMatchTypeOf<IdentityString<"@beep/iam-infra/adapters/repos">>();
  });

  it("creates stable service symbols", () => {
    const runtime = BeepId.from("@beep/runtime");
    const first = runtime.symbol();
    const second = runtime.symbol();

    expect(first).toBe(second);
    expect(first.description).toBe("@beep/runtime");
  });

  it("throws when a segment starts or ends with a slash", () => {
    const schemaId = BeepId.package("schema");

    expect(() => schemaId.compose("/annotations" as unknown as Segment)).toThrow(
      'Identity segments cannot start with "/".'
    );
    expect(() => schemaId.compose("annotations/" as unknown as Segment)).toThrow(
      'Identity segments cannot end with "/".'
    );
  });

  it("supports nested namespace segments", () => {
    const schemaId = BeepId.package("schema");
    const customDates = schemaId.compose("custom/dates");
    const full = customDates.make("DateTime");

    expect(customDates.string()).toBe("@beep/schema/custom/dates" as IdentityString<"@beep/schema/custom/dates">);
    expect(full).toBe("@beep/schema/custom/dates/DateTime" as IdentityString<"@beep/schema/custom/dates/DateTime">);
  });

  it("extends arbitrary namespaces", () => {
    const contractKit = BeepId.from("@beep/contract/contract-kit");
    const errorId = contractKit.make("ContractError");
    expect(errorId).toBe(
      "@beep/contract/contract-kit/ContractError" as IdentityString<"@beep/contract/contract-kit/ContractError">
    );
  });

  it("creates annotation helpers with optional extras", () => {
    const schemaId = BeepId.package("schema");
    const base = schemaId.annotations("MySchema");
    const extended = schemaId.annotations<string>("MySchema", { description: "Custom" });

    const MySchema = S.String.annotations(extended);

    const identityAnnotation = AST.getIdentifierAnnotation(MySchema.ast);

    expect(O.isSome(identityAnnotation)).toBe(true);

    expect(base.identifier).toBe("MySchema");
    expect(base.title).toBe("My Schema");
    expect(base.schemaId.description).toBe("@beep/schema/MySchema");
    expect(extended.description).toBe("Custom");
    expect(extended.schemaId).toBe(base.schemaId);
  });

  it("applies annotations to effect schema", () => {
    const schemaId = BeepId.package("schema");
    const annotation = schemaId.annotations<string>("MySchema", { description: "Custom" });

    const schema = S.String.annotations(annotation);

    const identifier = AST.getIdentifierAnnotation(schema.ast);
    const schemaSymbol = AST.getSchemaIdAnnotation(schema.ast);
    const description = AST.getDescriptionAnnotation(schema.ast);

    expect(identifier).toStrictEqual(O.some("MySchema"));
    expect(schemaSymbol).toStrictEqual(O.some(annotation.schemaId));
    expect(description).toStrictEqual(O.some("Custom"));
  });

  it("builds modules with PascalCase accessors", () => {
    const clients = BeepId.package("iam-sdk").compose("clients").module("Admin", "api-key", "passkey");

    const { AdminId, ApiKeyId, PasskeyId } = clients;

    expect(AdminId.string()).toBe("@beep/iam-sdk/clients/Admin" as IdentityString<"@beep/iam-sdk/clients/Admin">);
    expect(ApiKeyId.string()).toBe("@beep/iam-sdk/clients/api-key" as IdentityString<"@beep/iam-sdk/clients/api-key">);
    expect(PasskeyId.string()).toBe("@beep/iam-sdk/clients/passkey" as IdentityString<"@beep/iam-sdk/clients/passkey">);
    expectTypeOf(AdminId).toMatchTypeOf<IdentityComposer<"@beep/iam-sdk/clients/Admin">>();
    expectTypeOf(ApiKeyId).toMatchTypeOf<IdentityComposer<"@beep/iam-sdk/clients/api-key">>();
  });

  it("rejects module segments that cannot produce valid accessors", () => {
    const schemaId = BeepId.package("schema");

    expect(() => schemaId.module("1invalid")).toThrow(
      "Module segments must start with an alphabetic character to create valid accessors."
    );
    expect(() => schemaId.module("ann@tations" as Segment)).toThrow(
      "Module segments must contain only alphanumeric characters, hyphens, or underscores."
    );
  });
});
