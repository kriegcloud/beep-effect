import { HubSpot, HubSpotConfigInput, HubSpotSubmitFormRequest, HubSpotUpsertContactRequest } from "@beep/hubspot";
import { describe, expect, it } from "tstyche";

describe("@beep/hubspot", () => {
  it("exposes the typed public surface", () => {
    expect(HubSpot).type.not.toBe<never>();
    expect(HubSpotConfigInput.make({ accountId: "12345" })).type.toBe<HubSpotConfigInput>();
    expect(HubSpotSubmitFormRequest.make({ fields: [], formGuid: "form-guid" })).type.toBe<HubSpotSubmitFormRequest>();
    expect(
      HubSpotUpsertContactRequest.make({ email: "tom@example.com", properties: {} })
    ).type.toBe<HubSpotUpsertContactRequest>();
  });
});
