/** biome-ignore-all lint/suspicious/noExportsInTest: <explanation> */
import { Field, type MatchT } from "@beep/rete/network";
import { addConditionsToProduction } from "@beep/rete/network/add-conditions-to-production";
import { addProductionToSession } from "@beep/rete/network/add-production-to-session";
import { initProduction } from "@beep/rete/network/init-production";
import { initSession } from "@beep/rete/network/init-session";
import { describe, expect, it } from "@effect/vitest";
// biome-ignore lint/suspicious/noExportsInTest: <explanation>
export interface TestingSchema {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
  G: number;
  H: number;
  I: number;
  J: number;
  K: number;
  L: number;
  M: number;
  N: number;
  O: number;
  P: number;
  Q: number;
  R: number;
  S: number;
  T: number;
  U: number;
  V: number;
  W: number;
  X: number;
  Y: number;
  Z: number;
  Data: number;
  delta: number;
}

const convertMatchFn = (vars: MatchT<TestingSchema>) => vars;
export const testingSimpleSession = () => {
  const session = initSession<TestingSchema>(false);
  const makeProduction = (name: keyof TestingSchema) => {
    const valName = name.toLowerCase();
    const entJoin = "$ent";
    const production = initProduction<TestingSchema, MatchT<TestingSchema>>({
      name: `${name} production`,
      convertMatchFn,
      thenFn: () => {},
    });
    addConditionsToProduction(
      production,
      { name: "Delta", field: Field.Enum.IDENTIFIER },
      "delta",
      { name: "dt", field: Field.Enum.VALUE },
      true
    );
    addConditionsToProduction(
      production,
      { name: entJoin, field: Field.Enum.IDENTIFIER },
      name,
      { name: valName, field: Field.Enum.VALUE },
      false
    );
    addProductionToSession(session, production);
    return production;
  };
  makeProduction("A");
  return session;
};

describe("Simple testing session...", () => {
  it("has one production", () => {
    const session = testingSimpleSession();
    expect([...session.leafNodes.values()].length).toBe(1);
  });
});
