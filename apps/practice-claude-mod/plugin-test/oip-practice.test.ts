import { expect, mock, test } from "claude-code/testing";

const origin = { kind: "composer" };
const presentation = { isFullscreen: false, columns: 100 };

test("a verdict before any answer is refused politely", async ($, on) => {
  mock.store(on);
  mock.session(on);
  const result = await $.command.run({ command: "wrong", args: "", origin, presentation });
  expect(JSON.stringify(result)).toContain("There is no answer to mark yet.");
});

test("a verdict after an answer is saved and exported", async ($, on) => {
  mock.store(on);
  mock.clock(on);
  mock.session(on);
  on("ui.toast", () => ({ value: undefined }));
  on("fs.write", () => ({ value: undefined }));
  on("session.messages", () => ({ value: [{ role: "user", text: "Which matter is 10008US01?", toolUses: [] }] }));
  on("turn.complete", () => ({ text: "" }));
  on("session.id", () => ({ value: "s-1" }));
  await $.turn.complete({ answer: "It is 12345.10008US01.", turnId: "t-1", isAborted: false, durationMs: 10 });
  const saved = await $.command.run({ command: "wrong", args: "missed the continuation", origin, presentation });
  expect(JSON.stringify(saved)).toContain("Saved: Wrong");
  const exported = await $.command.run({ command: "practice", args: "export", origin, presentation });
  expect(JSON.stringify(exported)).toContain("Exported 1 verdicts");
});

for (const surface of ["terminal", "desktop"] as const) {
  test(`a practice-kg tool row reads as plain language on ${surface}`, async ($, on) => {
    mock.store(on);
    mock.session(on);
    const ui = await $.ui.mount({
      plugin: "oip-practice",
      surface,
      component: "ToolUse",
      props: {
        tool_use_id: "tu-1",
        tool: "mcp__practice-kg__kg_matter_lookup",
        input: { reference: "12345.10008US01" },
        isRunning: false,
        isErrored: false,
        isInterrupted: false,
      },
    });
    expect(JSON.stringify(await ui.drawn())).toContain("Looking up matter 12345.10008US01");
  });

  test(`another server's tool keeps the engine's row on ${surface}`, async ($, on) => {
    mock.store(on);
    mock.session(on);
    on("ui.render", ($, e) => $.ui.resolve(e).Text({ children: "engine-row" }));
    const ui = await $.ui.mount({
      plugin: "oip-practice",
      surface,
      component: "ToolUse",
      props: {
        tool_use_id: "tu-2",
        tool: "mcp__other__kg_find",
        input: { query: "x" },
        isRunning: false,
        isErrored: false,
        isInterrupted: false,
      },
    });
    const drawn = JSON.stringify(await ui.drawn());
    expect(drawn).toContain("engine-row");
    expect(drawn).not.toContain("Searching the firm");
  });
}
