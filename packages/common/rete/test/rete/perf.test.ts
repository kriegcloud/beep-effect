import type { MatchT } from "@beep/rete/network";
import { Field, rete } from "@beep/rete/network";
import { describe, expect, it } from "@effect/vitest";
import { performance } from "perf_hooks";

const bench = (name: string, fn: () => void) => {
  let cycle_n = 1;
  let cycle_ms = 0;
  let cycle_total_ms = 0;

  const bench_iter = (fn: () => void, count: number) => {
    const start = performance.now();
    for (let i = 0; i < count; i++) {
      fn();
    }
    const end = performance.now();
    return end - start;
  };

  // Run multiple cycles to get an estimate
  while (cycle_total_ms < 500) {
    const elapsed = bench_iter(fn, cycle_n);
    cycle_ms = elapsed / cycle_n;
    cycle_n *= 2;
    cycle_total_ms += elapsed;
  }

  // Try to estimate the iteration count for 500ms
  const target_n = 500 / cycle_ms;
  const total_ms = bench_iter(fn, target_n);

  return {
    hz: (target_n / total_ms) * 1_000, // ops/sec
    ms: total_ms / target_n, // ms/op
  };
};

interface Schema {
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

const convertMatchFn = (vars: MatchT<Schema>) => vars;

// Tests based on these benchmarks: https://github.com/noctjs/ecs-benchmark

it("test map instantiation", () => {
  const orig = new Map();
  orig.set("Delta", 1);
  orig.set("dt", 1);
  // @ts-expect-error
  const orig2 = new Map();
  orig.set("Delta", 1);
  orig.set("dt", 1);

  const mut3 = new Map();
  // @ts-expect-error
  let n = orig;
  const b = performance.now();
  for (let i = 0; i < 540_000; i++) {
    n = new Map(orig);
  }
  const a = performance.now();
  const b2 = performance.now();
  for (let i = 0; i < 540_000; i++) {
    mut3.set(i % 1000, i);
  }
  const a2 = performance.now();
  const b3 = performance.now();
  // @ts-expect-error
  let y: any;
  for (let i = 0; i < 540_000; i++) {
    y = () => i;
  }
  const a3 = performance.now();
  console.log("inst", a - b);
  console.log("mut", a2 - b2);
  console.log("fn", a3 - b3);
  expect(2).toBe(2);
});

describe("rete perf", () => {
  it("packed_5", () => {
    // @ts-expect-error
    const session = rete.initSession<Schema>(false, { enabled: true });
    const makeProduction = (name: keyof Schema) => {
      const valName = name.toLowerCase();
      const entJoin = "$ent";
      const production = rete.initProduction<Schema, MatchT<Schema>>({
        name: `${name} production`,
        convertMatchFn,
        thenFn: ({ vars }) => {
          const id = vars.get(entJoin)!;
          const val = vars.get(valName) as number;
          rete.insertFact(session, [id, name, val * 2]);
        },
      });
      rete.addConditionsToProduction(
        production,
        { name: "Delta", field: Field.Enum.IDENTIFIER },
        "delta",
        { name: "dt", field: Field.Enum.VALUE },
        true
      );
      rete.addConditionsToProduction(
        production,
        { name: entJoin, field: Field.Enum.IDENTIFIER },
        name,
        { name: valName, field: Field.Enum.VALUE },
        false
      );
      rete.addProductionToSession(session, production);
      return production;
    };
    const a = makeProduction("A");
    const b = makeProduction("B");
    makeProduction("C");
    makeProduction("D");
    makeProduction("E");

    rete.insertFact(session, ["Delta", "delta", 1]);
    const NUM_ENTITIES = 1000;
    for (let i = 0; i < NUM_ENTITIES; i++) {
      rete.insertFact(session, [i, "A", 1]);
      rete.insertFact(session, [i, "B", 1]);
      rete.insertFact(session, [i, "C", 1]);
      rete.insertFact(session, [i, "D", 1]);
      rete.insertFact(session, [i, "E", 1]);
    }
    rete.fireRules(session);
    rete.insertFact(session, ["Delta", "delta", 1]);
    rete.fireRules(session);
    rete.insertFact(session, ["Delta", "delta", 1]);
    // @ts-expect-error
    const x = rete.queryAll(session, a);
    // @ts-expect-error
    const y = rete.queryAll(session, b);
    // @ts-expect-error
    const before = performance.now();
    let count = 0;
    const { hz } = bench("packed5", () => {
      const dt = Math.random();
      rete.insertFact(session, ["Delta", "delta", dt]);
      rete.fireRules(session);
      count++;
    });
    // @ts-expect-error
    const after = performance.now();
    const measureMap = new Map<string, { total: number; count: number; avg: number }>();
    performance.getEntriesByType("measure").map((p) => {
      if (!measureMap.has(p.name)) {
        measureMap.set(p.name, { total: 0, count: 0, avg: 0 });
      }
      measureMap.get(p.name)!.count += 1;
      measureMap.get(p.name)!.total += p.duration;
    });
    const results: any = {};
    measureMap.forEach((agg, name) => {
      measureMap.get(name)!.avg = agg.total / agg.count;
      results[name] = measureMap.get(name);
    });
    expect(hz).toBeGreaterThan(1);
    expect(hz).toBeGreaterThan(10);
    // expect(hz).toBeGreaterThan(70)
    //   expect(hz).toBeGreaterThan(100)
    // expect(hz).toBeGreaterThan(1000)
    // expect(hz).toBeGreaterThan(10_000)
    // expect(hz).toBeGreaterThan(100_000)
    // expect(hz).toBeGreaterThan(300_000)
  });

  it("simple_iter", () => {
    const session = rete.initSession<Schema>(false);
    const makeProduction = (first: keyof Schema, second: keyof Schema) => {
      const firstValName = first.toLowerCase();
      const secondValName = second.toLowerCase();
      const firstJoin = "$first";
      const secondJoin = "$second";
      const production = rete.initProduction<Schema, MatchT<Schema>>({
        name: `${first}-${second}`,
        convertMatchFn,
        thenFn: ({ vars }) => {
          const firstId = vars.get(firstJoin)!;
          const secondId = vars.get(secondJoin)!;
          const firstVal = vars.get(firstValName) as number;
          const secondVal = vars.get(secondValName) as number;
          rete.insertFact(session, [firstId, second, firstVal]);
          rete.insertFact(session, [secondId, first, secondVal]);
        },
      });
      rete.addConditionsToProduction(
        production,
        { name: "Delta", field: Field.Enum.IDENTIFIER },
        "delta",
        { name: "dt", field: Field.Enum.VALUE },
        true
      );
      rete.addConditionsToProduction(
        production,
        { name: firstJoin, field: Field.Enum.IDENTIFIER },
        first,
        { name: firstValName, field: Field.Enum.VALUE },
        false
      );
      rete.addConditionsToProduction(
        production,
        { name: secondJoin, field: Field.Enum.IDENTIFIER },
        second,
        { name: secondValName, field: Field.Enum.VALUE },
        false
      );
      rete.addProductionToSession(session, production);
    };
    makeProduction("A", "B");
    makeProduction("C", "D");
    makeProduction("C", "E");

    rete.insertFact(session, ["Delta", "delta", 1]);
    const NUM_ENTITIES = 1;
    for (let i = 0; i < NUM_ENTITIES; i++) {
      const ab = `${i}ab`;
      rete.insertFact(session, [ab, "A", 0]);
      rete.insertFact(session, [ab, "B", 1]);
      const abc = `${i}abc`;
      rete.insertFact(session, [abc, "A", 0]);
      rete.insertFact(session, [abc, "B", 1]);
      rete.insertFact(session, [abc, "C", 2]);
      const abcd = `${i}abcd`;
      rete.insertFact(session, [abcd, "A", 0]);
      rete.insertFact(session, [abcd, "B", 1]);
      rete.insertFact(session, [abcd, "C", 2]);
      rete.insertFact(session, [abcd, "D", 3]);
      const abce = `${i}abce`;
      rete.insertFact(session, [abce, "A", 0]);
      rete.insertFact(session, [abce, "B", 1]);
      rete.insertFact(session, [abce, "C", 2]);
      rete.insertFact(session, [abce, "E", 3]);
    }
    rete.fireRules(session);

    const { hz } = bench("simple_iter", () => {
      rete.insertFact(session, ["Delta", "delta", 1]);
      rete.fireRules(session);
    });
    expect(hz).toBeGreaterThan(0);
    expect(hz).toBeGreaterThan(1);
    expect(hz).toBeGreaterThan(10);
    // expect(NUM_ENTITIES).toBeGreaterThan(99)
    // expect(hz).toBeGreaterThan(100)
    // expect(hz).toBeGreaterThan(1000)
    // expect(hz).toBeGreaterThan(10_000)
    // expect(hz).toBeGreaterThan(100_000)
  });

  it("frag_iter", () => {
    const session = rete.initSession<Schema>(false);
    const makeProduction = (name: keyof Schema) => {
      const valName = name.toLowerCase();
      const joinId = "$ent";
      const production = rete.initProduction<Schema, MatchT<Schema>>({
        name,
        convertMatchFn,
        thenFn: ({ vars }) => {
          const id = vars.get(joinId)!;
          const val = vars.get(valName) as number;
          rete.insertFact(session, [id, name, val * 2]);
        },
      });
      rete.addConditionsToProduction(
        production,
        { name: "Delta", field: Field.Enum.IDENTIFIER },
        "delta",
        { name: "dt", field: Field.Enum.VALUE },
        true
      );
      rete.addConditionsToProduction(
        production,
        { name: joinId, field: Field.Enum.IDENTIFIER },
        name,
        { name: valName, field: Field.Enum.VALUE },
        false
      );
      rete.addProductionToSession(session, production);
    };
    makeProduction("Z");
    makeProduction("Data");

    rete.insertFact(session, ["Delta", "delta", 1]);
    const NUM_ENTITIES = 100;
    const COMPS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") as (keyof Schema)[];
    for (let i = 0; i < NUM_ENTITIES; i++) {
      for (const comp of COMPS) {
        rete.insertFact(session, [`${i}${comp}`, comp, 1]);
        rete.insertFact(session, [`${i}${comp}`, "Data", 1]);
      }
    }
    rete.fireRules(session);

    const { hz } = bench("frag_iter", () => {
      rete.insertFact(session, ["Delta", "delta", 1]);
      rete.fireRules(session);
    });
    expect(hz).toBeGreaterThan(1);
    expect(hz).toBeGreaterThan(10);
    // expect(hz).toBeGreaterThan(100)
    // expect(hz).toBeGreaterThan(1000)
    // expect(hz).toBeGreaterThan(10_000)
    // expect(hz).toBeGreaterThan(100_000)
    // expect(hz).toBeGreaterThan(300_000)
    // expect(hz).toBeGreaterThan(500_000)
  });

  it("entity_cycle", () => {
    const session = rete.initSession<Schema>(false);
    const joinId = "$ent";
    const spawnB = rete.initProduction<Schema, MatchT<Schema>>({
      name: "Spawn B",
      convertMatchFn,
      thenFn: ({ vars }) => {
        const id = vars.get(joinId)!;
        const val = vars.get("a") as number;
        rete.insertFact(session, [`${id}B`, "B", val * 2]);
      },
    });
    rete.addConditionsToProduction(
      spawnB,
      { name: "Delta", field: Field.Enum.IDENTIFIER },
      "delta",
      { name: "dt", field: Field.Enum.VALUE },
      true
    );
    rete.addConditionsToProduction(
      spawnB,
      { name: joinId, field: Field.Enum.IDENTIFIER },
      "A",
      { name: "a", field: Field.Enum.VALUE },
      false
    );
    rete.addProductionToSession(session, spawnB);
    const retractB = rete.initProduction<Schema, MatchT<Schema>>({
      name: "Retract B",
      convertMatchFn,
      thenFn: ({ vars }) => {
        const id = vars.get(joinId) as string;
        rete.retractFactByIdAndAttr(session, id, "B");
      },
    });
    rete.addConditionsToProduction(
      spawnB,
      { name: "Delta", field: Field.Enum.IDENTIFIER },
      "delta",
      { name: "dt", field: Field.Enum.VALUE },
      true
    );
    rete.addConditionsToProduction(
      spawnB,
      { name: joinId, field: Field.Enum.IDENTIFIER },
      "B",
      { name: "b", field: Field.Enum.VALUE },
      false
    );
    rete.addProductionToSession(session, retractB);

    rete.insertFact(session, ["Delta", "delta", 1]);
    const NUM_ENTITIES = 1000;
    for (let i = 0; i < NUM_ENTITIES; i++) {
      rete.insertFact(session, [i, "A", 1]);
    }
    rete.fireRules(session);

    const { hz } = bench("entity_cycle", () => {
      rete.insertFact(session, ["Delta", "delta", 1]);
      rete.fireRules(session);
    });
    expect(hz).toBeGreaterThan(1);
    expect(hz).toBeGreaterThan(10);
    // expect(hz).toBeGreaterThan(100)
    // expect(hz).toBeGreaterThan(1000)
    // expect(hz).toBeGreaterThan(10_000)
    // expect(hz).toBeGreaterThan(100_000)
    // expect(hz).toBeGreaterThan(300_000)
    // expect(hz).toBeGreaterThan(500_000)
  });

  it("add_remove", () => {
    const session = rete.initSession<Schema>(false);
    const joinId = "$ent";
    const spawnB = rete.initProduction<Schema, MatchT<Schema>>({
      name: "Spawn B",
      convertMatchFn,
      thenFn: ({ vars }) => {
        const id = vars.get(joinId)!;
        const val = vars.get("a") as number;
        rete.insertFact(session, [id, "B", val * 2]);
      },
    });
    rete.addConditionsToProduction(
      spawnB,
      { name: "Delta", field: Field.Enum.IDENTIFIER },
      "delta",
      { name: "dt", field: Field.Enum.VALUE },
      true
    );
    rete.addConditionsToProduction(
      spawnB,
      { name: joinId, field: Field.Enum.IDENTIFIER },
      "A",
      { name: "a", field: Field.Enum.VALUE },
      false
    );
    rete.addProductionToSession(session, spawnB);
    const retractB = rete.initProduction<Schema, MatchT<Schema>>({
      name: "Retract B",
      convertMatchFn,
      thenFn: ({ vars }) => {
        const id = vars.get(joinId) as string;
        rete.retractFactByIdAndAttr(session, id, "B");
      },
    });
    rete.addConditionsToProduction(
      spawnB,
      { name: "Delta", field: Field.Enum.IDENTIFIER },
      "delta",
      { name: "dt", field: Field.Enum.VALUE },
      true
    );
    rete.addConditionsToProduction(
      spawnB,
      { name: joinId, field: Field.Enum.IDENTIFIER },
      "B",
      { name: "b", field: Field.Enum.VALUE },
      false
    );
    rete.addProductionToSession(session, retractB);

    rete.insertFact(session, ["Delta", "delta", 1]);
    const NUM_ENTITIES = 1000;
    for (let i = 0; i < NUM_ENTITIES; i++) {
      rete.insertFact(session, [i, "A", 1]);
    }
    rete.fireRules(session);

    const { hz } = bench("add_remove", () => {
      rete.insertFact(session, ["Delta", "delta", 1]);
      rete.fireRules(session);
    });
    expect(hz).toBeGreaterThan(1);
    expect(hz).toBeGreaterThan(10);
    // expect(hz).toBeGreaterThan(100)
    // expect(hz).toBeGreaterThan(1000)
    // expect(hz).toBeGreaterThan(10_000)
    // expect(hz).toBeGreaterThan(100_000)
    // expect(hz).toBeGreaterThan(300_000)
    // expect(hz).toBeGreaterThan(500_000)
  });
});
