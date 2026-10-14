import { beforeEach, describe, expect, it, vi } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { makeModHost } from "@/PracticeMod.host";
import { VerdictRow } from "@/PracticeMod.values";
import type { Engine } from "claude-code";

const decodeUnknownVerdictRowArray = S.decodeUnknownEffect(S.Array(VerdictRow));

const fixture = () => {
  const store = MutableHashMap.empty<string, unknown>();
  const engine = {
    plugin: { name: "oip-practice", root: "/plugin" },
    ui: {
      resolve: vi.fn<Engine["ui"]["resolve"]>(() => elements),
      invalidate: vi.fn<Engine["ui"]["invalidate"]>(),
      toast: vi.fn<Engine["ui"]["toast"]>(),
      status: vi.fn<Engine["ui"]["status"]>(),
    },
    command: { register: vi.fn<Engine["command"]["register"]>().mockResolvedValue(undefined) },
    store: {
      get: vi.fn<Engine["store"]["get"]>((key) => Promise.resolve(O.getOrUndefined(MutableHashMap.get(store, key)))),
      set: vi.fn<Engine["store"]["set"]>((key, value) => {
        MutableHashMap.set(store, key, value);
        return Promise.resolve();
      }),
    },
    fs: { write: vi.fn<Engine["fs"]["write"]>().mockResolvedValue(undefined) },
    mcp: { call: vi.fn<Engine["mcp"]["call"]>().mockResolvedValue({ content: [], isError: false }) },
    session: {
      id: vi.fn<Engine["session"]["id"]>().mockResolvedValue("s-1"),
      messages: vi.fn<Engine["session"]["messages"]>().mockResolvedValue([
        { role: "user", text: "Which matter is 10008US01?" },
        { role: "assistant", text: "An earlier answer." },
      ]),
    },
    clock: { now: vi.fn<Engine["clock"]["now"]>().mockResolvedValue(1000) },
  } satisfies Engine;
  // The engine owns opaque render elements; these spies inspect its requested props.
  const elements = {
    Box: vi.fn<ReturnType<Engine["ui"]["resolve"]>["Box"]>(),
    Text: vi.fn<ReturnType<Engine["ui"]["resolve"]>["Text"]>(),
    Button: vi.fn<ReturnType<Engine["ui"]["resolve"]>["Button"]>(),
  };
  return { engine, store, elements };
};

const abovePrompt = {
  surface: "terminal" as const,
  component: "AbovePrompt" as const,
  requestId: "request-1",
  props: { isWorking: false, maxRows: 3, bodyColumns: 100 },
};

beforeEach(() => vi.resetModules());

describe("practice hook host boundaries", { concurrent: false }, () => {
  it.effect(
    "registers the public commands and refuses a verdict before an answer",
    Effect.fnUntraced(function* () {
      const hooks = yield* Effect.promise(() => import("@/PracticeMod.hooks"));
      const { engine } = fixture();
      yield* Effect.promise(hooks.registerCommands(engine));
      expect(A.map(engine.command.register.mock.calls, ([command]) => command.name)).toEqual([
        "right",
        "wrong",
        "partly",
        "practice",
      ]);
      expect(yield* Effect.promise(() => hooks.verdictCommand(engine)("wrong", ""))).toEqual({
        text: "There is no answer to mark yet.",
      });
      expect(hooks.verdictBand(engine)(abovePrompt)).toBeUndefined();
      expect(engine.store.set).not.toHaveBeenCalled();
    })
  );

  it.effect(
    "ignores aborted and child turns, then records and undoes the main answer",
    Effect.fnUntraced(function* () {
      const hooks = yield* Effect.promise(() => import("@/PracticeMod.hooks"));
      const { engine, store, elements } = fixture();
      const answer = { answer: "12345.10008US01", turnId: "t-1", isAborted: false };
      yield* Effect.promise(() => hooks.rememberAnswer(engine)({ ...answer, isAborted: true }));
      yield* Effect.promise(() => hooks.rememberAnswer(engine)({ ...answer, agentId: "child" }));
      expect(engine.session.messages).not.toHaveBeenCalled();
      yield* Effect.promise(() => hooks.rememberAnswer(engine)(answer));
      expect(yield* Effect.promise(() => hooks.verdictCommand(engine)("wrong", "  missed the continuation  "))).toEqual(
        {
          text: "Saved: Wrong",
        }
      );
      hooks.verdictBand(engine)(abovePrompt);
      expect(A.map(elements.Button.mock.calls, ([props]) => props.label)).toEqual(["Right", "Wrong", "Partly", "Undo"]);
      expect(elements.Text).toHaveBeenCalledWith({ dimColor: true, children: "Saved: Wrong" });
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("undo"))).toEqual({ text: "Undone" });
      const rows = yield* store.pipe(
        MutableHashMap.get("verdict-rows"),
        O.getOrUndefined,
        decodeUnknownVerdictRowArray
      );
      expect(A.map(rows, (row) => row.revision)).toEqual([0, 1]);
      expect(A.map(rows, (row) => O.getOrUndefined(row.verdict))).toEqual(["wrong", undefined]);
      expect(O.getOrUndefined(A.getUnsafe(rows, 0).note)).toBe("missed the continuation");
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("export"))).toEqual({
        text: "Exported 2 verdicts to practice-verdicts.jsonl.",
      });
      expect(engine.fs.write).toHaveBeenCalledWith("practice-verdicts.jsonl", expect.stringContaining('"revision":1'));
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("unknown"))).toEqual({
        text: "Use /practice export, /practice undo, or /practice raw.",
      });
    })
  );

  it.effect(
    "reports save and export failures through their user-visible boundaries",
    Effect.fnUntraced(function* () {
      const hooks = yield* Effect.promise(() => import("@/PracticeMod.hooks"));
      const { engine } = fixture();
      yield* Effect.promise(() => hooks.rememberAnswer(engine)({ answer: "answer", turnId: "t-1", isAborted: false }));
      engine.store.set.mockRejectedValue("disk full");
      expect(yield* Effect.promise(() => hooks.verdictCommand(engine)("right", ""))).toEqual({
        text: "The verdict could not be saved. Try again.",
      });
      expect(engine.ui.toast).toHaveBeenCalledWith("The verdict could not be saved. Try again.");
      engine.fs.write.mockRejectedValue("write denied");
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("export"))).toEqual({
        text: "The verdicts could not be exported.",
      });
    })
  );

  it.effect(
    "preserves engine rows for other servers and supports raw, running, and failed rows",
    Effect.fnUntraced(function* () {
      const hooks = yield* Effect.promise(() => import("@/PracticeMod.hooks"));
      const { engine, elements } = fixture();
      const row = {
        surface: "terminal" as const,
        component: "ToolUse" as const,
        requestId: "request-1",
        props: {
          tool_use_id: "tu-1",
          tool: "mcp__practice-kg__kg_matter_lookup",
          input: { reference: "12345.10008US01" },
          isRunning: false,
          isErrored: false,
          isInterrupted: false,
        },
      };
      hooks.configure({ servers: [] });
      hooks.toolRow(engine)(row);
      expect(elements.Text).toHaveBeenLastCalledWith({ children: "Looking up matter 12345.10008US01" });
      hooks.toolRow(engine)({ ...row, props: { ...row.props, isRunning: true } });
      expect(elements.Text).toHaveBeenLastCalledWith({
        dimColor: true,
        children: "Looking up matter 12345.10008US01...",
      });
      hooks.toolRow(engine)({ ...row, props: { ...row.props, isErrored: true } });
      expect(elements.Text).toHaveBeenLastCalledWith({
        color: "red",
        children: "Looking up matter 12345.10008US01 (failed)",
      });
      elements.Text.mockClear();
      hooks.toolRow(engine)({ ...row, props: { ...row.props, tool: "mcp__other__kg_find" } });
      expect(elements.Text).not.toHaveBeenCalled();
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("raw"))).toEqual({
        text: "Showing the raw tool calls.",
      });
      hooks.toolRow(engine)(row);
      expect(elements.Text).not.toHaveBeenCalled();
      expect(yield* Effect.promise(() => hooks.practiceCommand(engine)("raw"))).toEqual({
        text: "Showing tool calls in plain language.",
      });
      hooks.configure({ servers: ["other"] });
      hooks.toolRow(engine)(row);
      expect(elements.Text).not.toHaveBeenCalled();
    })
  );

  it.effect(
    "maps rejected engine operations to their typed operation identity",
    Effect.fnUntraced(function* () {
      const { engine } = fixture();
      const host = makeModHost(engine);
      const cases = [
        { operation: "store-get", program: host.storeGet("key"), mock: engine.store.get },
        { operation: "store-set", program: host.storeSet("key", "value"), mock: engine.store.set },
        { operation: "fs-write", program: host.writeText("out.jsonl", "text"), mock: engine.fs.write },
        { operation: "session-id", program: host.sessionId, mock: engine.session.id },
        { operation: "clock", program: host.now, mock: engine.clock.now },
      ];
      for (const row of cases) {
        row.mock.mockRejectedValue("denied");
        const result = yield* row.program.pipe(Effect.result);
        expect(result).toMatchObject({
          _tag: "Failure",
          failure: { _tag: "ModHostError", operation: row.operation, message: "denied" },
        });
      }
    })
  );
});
