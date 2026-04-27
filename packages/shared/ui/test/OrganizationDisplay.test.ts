import * as Organization from "@beep/shared-ui/entities/Organization/index";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const displayInput = {
  id: 1,
  legalName: "Acme Legal LLC",
  licenseTier: "team",
  name: "Acme",
  settings: {
    allowAgentActions: true,
    defaultRetentionDays: 90,
  },
  slug: "acme",
} as const;

describe("Organization UI contracts", () => {
  it("decodes browser-safe display payloads", () => {
    const display = S.decodeUnknownSync(Organization.Display)(displayInput);

    expect(display.id).toBe(1);
    expect(display.licenseTier).toBe("team");
    expect(display.settings.defaultRetentionDays).toBe(90);
    expect(O.isNone(display.parentOrgId)).toBe(true);
  });

  it("decodes browser-safe form payloads with parent organizations", () => {
    const form = S.decodeUnknownSync(Organization.Form)({
      ...displayInput,
      parentOrgId: 1,
    });

    expect(form.slug).toBe("acme");
    expect(O.getOrThrow(form.parentOrgId)).toBe(1);
  });

  it("derives the primary display label from the organization name", () => {
    const display = S.decodeUnknownSync(Organization.Display)(displayInput);

    expect(Organization.primaryLabel(display)).toBe("Acme");
  });
});
