import { describe, expect, it } from "bun:test";
import { beep } from "../../src";

type Characters = [id: number, x: number, y: number][];

type Schema = {
  DeltaTime: number;
  TotalTime: number;
  X: number;
  Y: number;
  WindowWidth: number;
  WindowHeight: number;
  Width: number;
  Height: number;
  PressedKeys: Set<number>;
  XVelocity: number;
  YVelocity: number;
  XChange: number;
  YChange: number;
  AllCharacters: Characters;
};

describe("Basic Usage", () => {
  it("queries", () => {
    const { rule, insert, fire } = beep<Schema>();

    performance.now();
    const r = rule("queries", ({ X, Y }) => ({
      Player: {
        X,
        Y,
      },
    }));
    const enacted = r.enact();

    insert({
      Player: {
        X: 0.0,
        Y: 1.0,
      },
    });
    fire();
    const results = enacted.query();

    expect(results.length).toBe(1);

    const { Player } = results[0]!;

    expect(Player.X).toBe(0.0);
    expect(Player.Y).toBe(1.0);
  });

  it("avoiding infinite loops", () => {
    const { rule, insert, fire } = beep<Schema>();

    const notInfinite = rule("avoiding infiniite loops", ({ DeltaTime }) => ({
      Player: {
        X: { then: false },
      },
      Global: {
        DeltaTime,
      },
    })).enact({
      then: ({ Player, Global }) => {
        console.log("firing");
        insert({ [Player.id]: { X: Player.X + Global.DeltaTime } });
      },
    });

    insert({
      Player: {
        X: 0.0,
        Y: 1.0,
      },
      Global: {
        DeltaTime: 0.5,
      },
    });
    fire();

    expect(notInfinite.query()[0]!.Player.X).toBe(0.5);
  });

  it("conditions", () => {
    const { rule, insert } = beep<Schema>(true);

    rule("movePlayer", ({ DeltaTime, X, Y, WindowHeight }) => ({
      Global: {
        DeltaTime,
      },
      Player: {
        X: { then: false },
      },
    })).enact({
      then: (args) => insert({ Player: { X: args.Player.X + args.Global.DeltaTime } }),
    });

    const getPlayer = rule("getPlayer", ({ X, Y }) => ({
      Player: {
        X,
        Y,
      },
    })).enact();

    rule("stopPlayer", ({ WindowWidth, X }) => ({
      Global: {
        WindowWidth,
      },
      Player: {
        X,
      },
    })).enact({
      when: ({ Player, Global }) => Player.X >= Global.WindowWidth && Global.WindowWidth > 0,
      then: ({ Player }) => insert({ Player: { X: 0 } }),
    });

    insert({
      Player: {
        X: 0,
        Y: 1,
      },
      Global: {
        WindowWidth: 100,
        DeltaTime: 100,
      },
    });

    expect(getPlayer.query()[0]!.Player.X).toBe(0);
  });

  it("complex types", () => {
    const { rule, insert } = beep<Schema>(true);

    rule("movePlayer", ({ DeltaTime }) => ({
      Global: {
        DeltaTime,
        PressedKeys: { then: false },
      },
      Player: {
        X: { then: false },
      },
    })).enact({
      then: ({ Player, Global }) => {
        if (Global.PressedKeys.has(263)) {
          insert({ Player: { X: Player.X - 1 } });
        } else if (Global.PressedKeys.has(262)) {
          insert({ Player: { X: Player.X + 1 } });
        }
      },
    });

    const getPlayer = rule("getPlayer", ({ X, Y }) => ({
      Player: {
        X,
        Y,
      },
    })).enact();

    rule("getKeys", ({ PressedKeys }) => ({
      Global: {
        PressedKeys,
      },
    })).enact();

    rule("stopPlayer", ({ WindowWidth, X }) => ({
      Global: { WindowWidth },
      Player: { X },
    })).enact({
      when: ({ Global, Player }) => Player.X >= Global.WindowWidth && Global.WindowWidth > 0,
      then: () => insert({ Player: { X: 0 } }),
    });

    insert({
      Player: {
        X: 0,
        Y: 1,
      },
      Global: {
        WindowWidth: 100,
        DeltaTime: 100,
        PressedKeys: new Set([262]),
      },
    });

    expect(getPlayer.query()[0]!.Player.X).toBe(1);
  });

  it("joins and advanced queries", () => {
    const { rule, insert } = beep<Schema>(true);

    rule("getPlayer", ({ X, Y }) => ({
      Player: {
        X,
        Y,
      },
    })).enact();

    const getCharacter = rule("getCharacter", ({ X, Y }) => ({
      $character: {
        X,
        Y,
      },
    })).enact();

    rule("stopPlayer", ({ WindowWidth, X }) => ({
      Global: {
        WindowWidth,
      },
      Player: {
        X,
      },
    })).enact({
      when: ({ Player, Global }) => Player.X >= Global.WindowWidth && Global.WindowWidth > 0,
      then: ({ Player }) => insert({ Player: { X: 0 } }),
    });

    insert({
      Global: {
        WindowWidth: 100,
      },
      Player: {
        X: 0,
        Y: 1,
      },
    });
    const results = getCharacter.query();
    expect(results.length).toBe(1);
    const $character = results[0]!.$character;
    expect($character.id).toBe("Player");
    expect($character.X).toBe(0);
    expect($character.Y).toBe(1);
  });
});
