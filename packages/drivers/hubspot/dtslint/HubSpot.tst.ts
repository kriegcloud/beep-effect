import {
  HubSpot,
  HubSpotConfigInput,
  HubSpotSubmitFormRequest,
  HubSpotUpsertContactRequest,
  VERSION,
} from "@beep/hubspot";
import { describe, expect, it } from "tstyche";

describe("@beep/hubspot", () => {
  it("exposes the typed public surface", () => {
    expect(VERSION).type.toBe<"0.0.0">();
    expect(HubSpot).type.not.toBe<never>();
    expect(new HubSpotConfigInput({ accountId: "12345" })).type.toBe<HubSpotConfigInput>();
    expect(new HubSpotSubmitFormRequest({ fields: [], formGuid: "form-guid" })).type.toBe<HubSpotSubmitFormRequest>();
    expect(
      new HubSpotUpsertContactRequest({ email: "tom@example.com", properties: {} })
    ).type.toBe<HubSpotUpsertContactRequest>();
  });
});
