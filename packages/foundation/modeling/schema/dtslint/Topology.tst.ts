import type * as Color from "@beep/schema/Color";
import type * as Csp from "@beep/schema/Csp";
import type * as CsvParser from "@beep/schema/CsvParser";
import type * as DomainModel from "@beep/schema/DomainModel";
import type * as EntitySchema from "@beep/schema/EntitySchema";
import type * as EvmAddress from "@beep/schema/EvmAddress";
import type { EvmAddressRedacted, EvmAddress as EvmAddressType } from "@beep/schema/EvmAddress";
import type * as FilePath from "@beep/schema/FilePath";
import type * as Fn from "@beep/schema/Fn";
import type * as Graph from "@beep/schema/Graph";
import type * as HttpStatus from "@beep/schema/HttpStatus";
import type * as LiteralKit from "@beep/schema/LiteralKit";
import type * as MappedLiteralKit from "@beep/schema/MappedLiteralKit";
import type * as Model from "@beep/schema/Model";
import type * as ParserOptions from "@beep/schema/ParserOptions";
import type * as Record from "@beep/schema/Record";
import type * as SchemaUtils from "@beep/schema/SchemaUtils";
import type { split } from "@beep/schema/SchemaUtils/split";
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

  it("exposes canonical topology-cleanup concept modules", () => {
    expect<typeof Color.HexColor>().type.toBe<typeof Color.HexColor>();
    expect<typeof Color.HexToRgb>().type.toBe<typeof Color.HexToRgb>();
    expect<typeof HttpStatus.Schema>().type.toBe<typeof HttpStatus.HttpStatus>();
    expect<HttpStatus.HttpStatus4XX>().type.toBe<
      | 400
      | 401
      | 402
      | 403
      | 404
      | 405
      | 406
      | 407
      | 408
      | 409
      | 410
      | 411
      | 412
      | 413
      | 414
      | 415
      | 416
      | 417
      | 418
      | 421
      | 422
      | 423
      | 424
      | 425
      | 426
      | 428
      | 429
      | 431
      | 451
    >();
  });

  it("exposes explicit exact subpaths without broad package wildcard reliance", () => {
    expect<typeof DomainModel.DomainModel>().type.toBe<typeof DomainModel.DomainModel>();
    expect<typeof Fn.Fn>().type.toBe<typeof Fn.Fn>();
    expect<typeof LiteralKit.LiteralKit>().type.toBe<typeof LiteralKit.LiteralKit>();
    expect<typeof MappedLiteralKit.MappedLiteralKit>().type.toBe<typeof MappedLiteralKit.MappedLiteralKit>();
    expect<Record.UnknownRecord>().type.toBe<Record.UnknownRecord>();
    expect<typeof split>().type.toBe<typeof SchemaUtils.split>();
  });

  it("keeps concept role files private", () => {
    // @ts-expect-error!
    void import("@beep/schema/Duration/Duration.schema");

    // @ts-expect-error!
    void import("@beep/schema/Graph/Graph.edge");

    // @ts-expect-error!
    void import("@beep/schema/HttpStatus/HttpStatus.category");

    // @ts-expect-error!
    void import("@beep/schema/Color/Color.hex");

    // @ts-expect-error!
    void import("@beep/schema/color/Color.hex");

    // @ts-expect-error!
    void import("@beep/schema/ExpectCT");

    // @ts-expect-error!
    void import("@beep/schema/XSSProtection");
  });
});
