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

const formInput = {
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
      ...formInput,
      parentOrgId: 1,
    });

    expect(form.slug).toBe("acme");
    expect(O.getOrThrow(form.parentOrgId)).toBe(1);
  });

  it("decodes null parent organization ids as None", () => {
    const display = S.decodeUnknownSync(Organization.Display)({
      ...displayInput,
      parentOrgId: null,
    });
    const form = S.decodeUnknownSync(Organization.Form)({
      ...formInput,
      parentOrgId: null,
    });

    expect(display.parentOrgId).toEqual(O.none());
    expect(form.parentOrgId).toEqual(O.none());
  });

  it("derives the primary display label from the organization name", () => {
    const display = S.decodeUnknownSync(Organization.Display)(displayInput);

    expect(Organization.primaryLabel(display)).toBe("Acme");
  });

  it("encodes nullish parent organization ids for browser payloads", () => {
    const withoutParent = S.decodeUnknownSync(Organization.Display)(displayInput);
    const withParent = S.decodeUnknownSync(Organization.Display)({
      ...displayInput,
      parentOrgId: 1,
    });
    const formWithoutParent = S.decodeUnknownSync(Organization.Form)(formInput);

    expect(S.encodeSync(Organization.Display)(withoutParent).parentOrgId).toBeNull();
    expect(S.encodeSync(Organization.Display)(withParent).parentOrgId).toBe(1);
    expect(S.encodeSync(Organization.Form)(formWithoutParent).parentOrgId).toBeNull();
  });

  it("rejects invalid browser-safe organization payload fields", () => {
    expect(() =>
      S.decodeUnknownSync(Organization.Display)({
        ...displayInput,
        licenseTier: "custom",
      })
    ).toThrow();
    expect(() =>
      S.decodeUnknownSync(Organization.Display)({
        ...displayInput,
        name: "",
      })
    ).toThrow();
    expect(() =>
      S.decodeUnknownSync(Organization.Display)({
        ...displayInput,
        settings: {
          ...displayInput.settings,
          defaultRetentionDays: 0,
        },
      })
    ).toThrow();
    expect(() =>
      S.decodeUnknownSync(Organization.Display)({
        ...displayInput,
        slug: "Invalid Slug",
      })
    ).toThrow();
  });
});
