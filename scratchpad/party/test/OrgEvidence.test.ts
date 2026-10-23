/**
 * Organization evidence from email domains.
 */
import { describe, expect, it } from "@effect/vitest";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import { UtcInstant } from "../Time.ts";
import { classifyByOrganization, nameShape, organizationDomain } from "../adapters/OrgEvidence.ts";

const at = UtcInstant.make;
const box = (domains: ReadonlyArray<string>, span: O.Option<readonly [string, string]>) => ({
  domains: HashSet.fromIterable(domains),
  span: O.map(span, ([a, b]) => [at(a), at(b)] as const),
});
const y = (a: number, b: number) => O.some([`${a}-01-01T00:00:00Z`, `${b}-01-01T00:00:00Z`] as const);

describe("organization domains", () => {
  it("reduces hosts to the registrable domain and ignores free mail", () => {
    expect(organizationDomain("riley@mail.acme.example")).toEqual(O.some("acme.example"));
    expect(organizationDomain("pat@firm.co.uk")).toEqual(O.some("firm.co.uk"));
    expect(organizationDomain("someone@gmail.com")).toEqual(O.none());
    expect(organizationDomain("not-an-address")).toEqual(O.none());
  });
});

describe("organization leads", () => {
  it("reads a shared domain as an alias", () => {
    expect(classifyByOrganization([box(["acme.example"], y(2019, 2021)), box(["acme.example"], y(2020, 2022))])).toBe(
      "same-org-alias"
    );
  });

  it("reads different organizations at the same time as different people", () => {
    expect(classifyByOrganization([box(["acme.example"], y(2019, 2021)), box(["other.example"], y(2020, 2022))])).toBe(
      "different-orgs-concurrent"
    );
  });

  it("reads different organizations at different times as a possible career move", () => {
    expect(classifyByOrganization([box(["acme.example"], y(2015, 2018)), box(["other.example"], y(2019, 2022))])).toBe(
      "different-orgs-sequential"
    );
  });

  it("does not guess when time or organization evidence is missing", () => {
    expect(classifyByOrganization([box(["acme.example"], O.none()), box(["other.example"], y(2019, 2022))])).toBe(
      "different-orgs-undated"
    );
    expect(classifyByOrganization([box([], y(2015, 2018)), box(["other.example"], y(2019, 2022))])).toBe(
      "no-org-evidence"
    );
  });
});

describe("name shape", () => {
  it("treats single-token display names as low-information aliases", () => {
    expect(nameShape("chris morgan")).toBe("full-name");
    expect(nameShape("morgan, chris")).toBe("full-name");
    expect(nameShape("support")).toBe("single-token");
  });
});
