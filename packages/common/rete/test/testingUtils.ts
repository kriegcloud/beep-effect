import { describe, expect, it } from "bun:test";
import * as S from "effect/Schema";
import { Field, type MatchT } from "../src/network";
import { addConditionsToProduction } from "../src/network/add-conditions-to-production";
import { addProductionToSession } from "../src/network/add-production-to-session";
import { initProduction } from "../src/network/init-production";
import { initSession } from "../src/network/init-session";

export const TestingSchema = S.Struct({
  A: S.Number,
  B: S.Number,
  C: S.Number,
  D: S.Number,
  E: S.Number,
  F: S.Number,
  G: S.Number,
  H: S.Number,
  I: S.Number,
  J: S.Number,
  K: S.Number,
  L: S.Number,
  M: S.Number,
  N: S.Number,
  O: S.Number,
  P: S.Number,
  Q: S.Number,
  R: S.Number,
  S: S.Number,
  T: S.Number,
  U: S.Number,
  V: S.Number,
  W: S.Number,
  X: S.Number,
  Y: S.Number,
  Z: S.Number,
  Data: S.Number,
  delta: S.Number,
});
export type TestingSchema = typeof TestingSchema.Type;

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
