import { describe, expect, it } from "tstyche";
import type * as OrganizationDomain from "@beep/shared-domain/entities/Organization";
import type * as Shared from "@beep/shared-domain/identity/Shared";
import type * as OrganizationUi from "@beep/shared-ui/entities/Organization";
import type * as O from "effect/Option";

describe("Organization UI types", () => {
  it("preserves display payload field types", () => {
    expect<typeof OrganizationUi.Display.fields.id.Type>().type.toBe<Shared.OrganizationId>();
    expect<typeof OrganizationUi.Display.fields.licenseTier.Type>().type.toBe<OrganizationDomain.LicenseTier>();
    expect<typeof OrganizationUi.Display.fields.parentOrgId.Type>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof OrganizationUi.Display.fields.settings.Type>().type.toBe<OrganizationDomain.Settings>();
  });

  it("preserves form payload field types without an id", () => {
    expect<typeof OrganizationUi.Form.fields.licenseTier.Type>().type.toBe<OrganizationDomain.LicenseTier>();
    expect<typeof OrganizationUi.Form.fields.parentOrgId.Type>().type.toBe<O.Option<Shared.OrganizationId>>();
    expect<typeof OrganizationUi.Form.fields.settings.Type>().type.toBe<OrganizationDomain.Settings>();
  });

  it("keeps display helpers pure and browser safe", () => {
    expect<typeof OrganizationUi.primaryLabel>().type.toBe<
      (organization: Pick<OrganizationUi.Display, "name">) => string
    >();
  });
});
