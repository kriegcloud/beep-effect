import { describe, expect, it } from "bun:test";
import { beep } from "../../src";

const playerFacts = {
  player: {
    x: 10,
    y: 10,
    health: 100,
  },
};

const treasureFacts = {
  treasure1: { x: 12, y: -1, value: 100 },
  treasure2: { x: 2, y: 21, value: 3230 },
};

const villagerFacts = {
  villager: {
    x: 30,
    y: 120,
    health: 30,
  },
};

const enemyFacts = {
  enemy1: {
    x: 0,
    y: 120,
    health: 5,
    isEvil: true,
  },
  enemy2: {
    x: -10,
    y: 12,
    health: 0,
    isEvil: true,
  },
};

const treeFacts = {
  tree: {
    x: 0,
    y: 120,
  },
};

const timeFacts = {
  time: {
    dt: 15,
  },
};

const allFacts = {
  ...playerFacts,
  ...enemyFacts,
  ...villagerFacts,
  ...treasureFacts,
  ...treeFacts,
  ...timeFacts,
};

const mkEdict = () => {
  const { rule, insert, retract, ...rest } = beep<{
    health: number;
    isDying: boolean;
    dt: number;
    value: number;
    x: number;
    y: number;
    isEvil: boolean;
  }>();

  return {
    insert,
    retract,
    ...rest,
    queries: {
      time: rule("time", ({ dt }) => ({
        time: {
          dt,
        },
      })).enact(),
      allTreasure: rule("all_treasure", ({ value, x, y }) => ({
        $treasure: {
          value,
          x,
          y,
        },
      })).enact(),

      allNpcs: rule("all_npcs", ({ health, x, y }) => ({
        $npc: {
          health,
          x,
          y,
        },
      })).enact(),

      allNpcsWithTimeDt: rule("all_npcs_with_time_dt", ({ health, x, y, dt }) => ({
        $npc: {
          health,
          x,
          y,
        },
        time: {
          dt,
        },
      })).enact(),

      noHealthIsDying: rule("no_health_is_dying", ({ health, dt }) => ({
        $npc: {
          health,
        },
      })).enact({
        when: ({ $npc }) => $npc.health <= 0,
        then: ({ $npc }) => {
          retract($npc.id, "health");
          insert({ [$npc.id]: { isDying: true } });
        },
      }),

      isDying: rule("id_dying", ({ isDying }) => ({
        $npc: {
          isDying,
        },
      })).enact({
        when: ({ $npc }) => $npc.isDying,
      }),

      complicatedNonsense: rule("complicated_nonsense", ({ health, x, y, value, dt }) => ({
        $npc: {
          health,
          x,
          y,
        },
        $treasure: {
          value,
          x,
          y,
        },
        time: {
          dt,
        },
      })).enact(),
    },
  };
};

describe("beep", () => {
  it("simple unbound query works", () => {
    const { insert, fire, queries } = mkEdict();

    insert(timeFacts);
    fire();

    const results = queries.time.query();
    const expectedResults = [{ time: { id: "time", ...timeFacts.time } }];
    expect(results).toStrictEqual(expectedResults);
  });
  it("simple bound query works", () => {
    const { insert, fire, queries } = mkEdict();

    insert(villagerFacts);
    fire();

    const results = queries.allNpcs.query();
    const expectedResults = [{ $npc: { id: "villager", ...villagerFacts.villager } }];
    expect(results).toStrictEqual(expectedResults);
  });
  it("complicated happy path is happy", () => {
    const { insert, fire, queries } = mkEdict();

    insert(allFacts);
    fire();

    const results = queries.isDying.query();
    const expectedResults = [{ $npc: { id: "enemy2", isDying: true } }];
    expect(results).toStrictEqual(expectedResults);
  });

  it("Missing fact will result in empty array", () => {
    // None of the players are dying, so if those are the only facts the
    // the is_dying rule should be empty
    const { insert, fire, queries } = mkEdict();
    insert(playerFacts);
    fire();

    const results = queries.isDying.query();
    expect(results).toStrictEqual([]);
  });

  it("Retracting facts works", () => {
    const { queries, retract, insert, fire } = mkEdict();
    const facts = {
      ...playerFacts,
      ...villagerFacts,
      ...timeFacts,
    };
    insert(facts);
    fire();
    const beforeRetract = queries.allNpcsWithTimeDt.query();
    const expectedBeforeRetract = [
      {
        $npc: { id: "player", health: 100, x: 10, y: 10 },
        time: { id: "time", dt: 15 },
      },
      {
        $npc: { id: "villager", health: 30, x: 30, y: 120 },
        time: { id: "time", dt: 15 },
      },
    ];
    expect(beforeRetract).toStrictEqual(expectedBeforeRetract);
    retract("villager", "x", "y", "health");
    fire();
    const results = queries.allNpcsWithTimeDt.query();
    const expectedResults = [
      {
        $npc: { id: "player", health: 100, x: 10, y: 10 },
        time: { id: "time", dt: 15 },
      },
      // No villager facts
    ];
    expect(results).toStrictEqual(expectedResults);
  });
});
