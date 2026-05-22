import type * as Csp from "@beep/schema/Csp";
import type * as CsvParser from "@beep/schema/CsvParser";
import type * as EntitySchema from "@beep/schema/EntitySchema";
import type * as EvmAddress from "@beep/schema/EvmAddress";
import type { EvmAddressRedacted, EvmAddress as EvmAddressType } from "@beep/schema/EvmAddress";
import type * as FilePath from "@beep/schema/FilePath";
import type * as Graph from "@beep/schema/Graph";
import type * as Model from "@beep/schema/Model";
import type * as ParserOptions from "@beep/schema/ParserOptions";
import type * as VariantSchema from "@beep/schema/VariantSchema";
import type * as XssProtection from "@beep/schema/XssProtection";
import { describe, expect, it } from "tstyche";

describe("@beep/schema topology", () => {
  it("exposes canonical schema aliases from leaf concept modules", () => {
    expect<typeof EvmAddress.Schema>().type.toBe<typeof EvmAddress.EvmAddress>();
    expect<EvmAddress.Schema>().type.toBe<EvmAddressType>();
    expect<EvmAddress.Redacted>().type.toBe<EvmAddressRedacted>();
  });

  it("exposes canonical helper aliases from role-oriented concept modules", () => {
    expect<typeof CsvParser.parse>().type.toBe<typeof CsvParser.parseCsvRows>();
    expect<typeof ParserOptions.Schema>().type.toBe<typeof ParserOptions.ParserOptions>();
    expect<typeof ParserOptions.Error>().type.toBe<typeof ParserOptions.ParserOptionsError>();
  });

  it("exposes concise header aliases from HTTP header concept modules", () => {
    expect<typeof Csp.Header>().type.toBe<typeof Csp.ContentSecurityPolicyHeader>();
    expect<typeof XssProtection.Header>().type.toBe<typeof XssProtection.XSSProtectionHeader>();
  });

  it("exposes canonical high-context concept modules", () => {
    expect<FilePath.FilePath>().type.toBe<FilePath.FilePath>();
    expect<Graph.GraphKind>().type.toBe<Graph.GraphKind>();
    expect<typeof Model.DateTimeInsertFromNumber>().type.toBe<Model.DateTimeInsertFromNumber>();
    expect<typeof EntitySchema.DateTimeFromMillis>().type.toBe<typeof EntitySchema.DateTimeFromMillis>();
    expect<typeof VariantSchema.TypeId>().type.toBe<"~effect/schema/VariantSchema">();
  });
});
