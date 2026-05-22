import type * as Csp from "@beep/schema/Csp";
import type * as CsvParser from "@beep/schema/CsvParser";
import type * as EvmAddress from "@beep/schema/EvmAddress";
import type { EvmAddressRedacted, EvmAddress as EvmAddressType } from "@beep/schema/EvmAddress";
import type * as ParserOptions from "@beep/schema/ParserOptions";
import type * as XssProtection from "@beep/schema/XssProtection";
import { describe, expect, it } from "tstyche";

describe("@beep/schema topology", () => {
  it("exposes canonical schema aliases from leaf concept modules", () => {
    expect<typeof EvmAddress.Schema>().type.toBe<typeof EvmAddress.EvmAddress>();
    expect<typeof EvmAddress.Schema.Type>().type.toBe<EvmAddressType>();
    expect<typeof EvmAddress.Redacted.Type>().type.toBe<EvmAddressRedacted>();
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
});
