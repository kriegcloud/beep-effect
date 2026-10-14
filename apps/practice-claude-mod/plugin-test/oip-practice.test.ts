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

const matterFixture = (resolution: string, keys: string[]) => ({
  bundle_version: "fixture-v1",
  epistemic_status: "derived-from-official-records",
  tier: "minimal",
  total: keys.length,
  truncated: false,
  data: {
    columns: ["client", "docketKey", "familyKey", "resolution"],
    rows: keys.map((key) => ["12345", key, "12345.10008", resolution]),
  },
});

test("/matter selects a unique result and attaches it to later verdicts", async ($, on) => {
  const stored: Record<string, unknown> = {};
  on("store.get", (_$, e) => ({ value: stored[e.key] }));
  on("store.set", (_$, e) => {
    stored[e.key] = e.value;
    return { value: undefined };
  });
  mock.session(on);
  mock.clock(on);
  on("mcp.call", { server: "practice-kg", tool: "kg_matter_lookup" }, (_$, e) => {
    expect(e.args).toEqual({ reference: "10008" });
    return {
      value: {
        content: [{ type: "text", text: JSON.stringify(matterFixture("unique", ["12345.10008US01"])) }],
        isError: false,
      },
    };
  });
  on("ui.toast", () => ({ value: undefined }));
  on("session.messages", () => ({ value: [{ role: "user", text: "Which matter?", toolUses: [] }] }));
  on("session.id", () => ({ value: "s-1" }));
  on("turn.complete", () => ({ text: "" }));
  const selected = await $.command.run({ command: "matter", args: "10008", origin, presentation });
  expect(JSON.stringify(selected)).toContain("Matter: 12345.10008US01");
  expect(JSON.stringify(await $.command.run({ command: "matter", args: "", origin, presentation }))).toContain(
    "12345.10008US01"
  );
  await $.turn.complete({ answer: "Fixture answer", turnId: "t-1", isAborted: false, durationMs: 10 });
  await $.command.run({ command: "right", args: "", origin, presentation });
  expect(JSON.stringify(stored["verdict-items"])).toContain('"docketKey":"12345.10008US01"');
  await $.command.run({ command: "matter", args: "clear", origin, presentation });
  expect(JSON.stringify(await $.command.run({ command: "matter", args: "", origin, presentation }))).toContain(
    "No matter is selected."
  );
});

test("/matter ambiguous lists at most five keys and preserves the prior choice", async ($, on) => {
  mock.store(on);
  mock.session(on);
  on("mcp.call", (_$, e) => {
    const fixture =
      e.args.reference === "chosen"
        ? matterFixture("unique", ["12345.10008US01"])
        : matterFixture("ambiguous", [
            "12345.10008US02",
            "12345.10008US03",
            "12345.10008US04",
            "12345.10008US05",
            "12345.10008US06",
            "12345.10008US07",
          ]);
    return { value: { content: [], isError: false, structuredContent: fixture } };
  });
  await $.command.run({ command: "matter", args: "chosen", origin, presentation });
  const response = JSON.stringify(await $.command.run({ command: "matter", args: "10008", origin, presentation }));
  expect(response).toContain("Repeat /matter");
  expect(response).toContain("12345.10008US06");
  expect(response).not.toContain("12345.10008US07");
  expect(JSON.stringify(await $.command.run({ command: "matter", args: "", origin, presentation }))).toContain(
    "12345.10008US01"
  );
});

test("/matter none gives a plain reply without choosing a matter", async ($, on) => {
  mock.store(on);
  mock.session(on);
  on("mcp.call", () => ({
    value: { content: [{ type: "text", text: JSON.stringify(matterFixture("none", [])) }], isError: false },
  }));
  expect(JSON.stringify(await $.command.run({ command: "matter", args: "missing", origin, presentation }))).toContain(
    "No matter matches missing."
  );
  expect(JSON.stringify(await $.command.run({ command: "matter", args: "", origin, presentation }))).toContain(
    "No matter is selected."
  );
});

test("/time is explicit, saves one interval, and exports alongside verdicts", async ($, on) => {
  mock.store(on);
  mock.session(on);
  const clock = mock.clock(on);
  on("session.id", () => ({ value: "s-1" }));
  on("ui.toast", () => ({ value: undefined }));
  const files: Record<string, string> = {};
  on("fs.write", (_$, e) => {
    files[e.path.split("/").pop() ?? e.path] = e.text;
    return { value: undefined };
  });
  expect(JSON.stringify(await $.command.run({ command: "time", args: "", origin, presentation }))).toContain(
    "Timer is stopped."
  );
  await $.command.run({ command: "time", args: "start", origin, presentation });
  await clock.advance(120_000);
  expect(JSON.stringify(await $.command.run({ command: "time", args: "start", origin, presentation }))).toContain(
    "already running"
  );
  expect(JSON.stringify(await $.command.run({ command: "time", args: "", origin, presentation }))).toContain(
    "2 minutes"
  );
  expect(JSON.stringify(await $.command.run({ command: "time", args: "stop", origin, presentation }))).toContain(
    "Interval saved"
  );
  await $.command.run({ command: "time", args: "stop", origin, presentation });

  await $.command.run({ command: "practice", args: "export", origin, presentation });
  expect(files["practice-timer.jsonl"].trim().split("\n").length).toBe(1);
  expect(files["practice-timer.jsonl"]).toContain("practice-timer/v1");
  expect(files["practice-verdicts.jsonl"]).toBe("");
});

for (const surface of ["terminal", "desktop"] as const) {
  test(`matter and running minutes share the band with verdict controls on ${surface}`, async ($, on) => {
    mock.store(on);
    mock.session(on);
    const clock = mock.clock(on);
    on("session.id", () => ({ value: "s-1" }));
    on("session.messages", () => ({ value: [{ role: "user", text: "Fixture question", toolUses: [] }] }));
    on("turn.complete", () => ({ text: "" }));
    on("ui.toast", () => ({ value: undefined }));
    on("mcp.call", () => ({
      value: { content: [], isError: false, structuredContent: matterFixture("unique", ["12345.10008US01"]) },
    }));
    await $.command.run({ command: "matter", args: "10008", origin, presentation });
    const ui = await $.ui.mount({
      plugin: "oip-practice",
      surface,
      component: "AbovePrompt",
      props: { isWorking: false, maxRows: 5, bodyColumns: 100 },
    });
    expect(JSON.stringify(await ui.drawn())).toContain("Matter: 12345.10008US01");
    await $.command.run({ command: "time", args: "start", origin, presentation });
    await clock.advance(120_000);
    expect(JSON.stringify(await ui.drawn())).toContain("Timer: 2 minutes");
    await $.turn.complete({ answer: "Fixture answer", turnId: "t-1", isAborted: false, durationMs: 10 });
    expect(JSON.stringify(await ui.drawn())).toContain("Right");
    await $.command.run({ command: "matter", args: "clear", origin, presentation });
    const drawn = JSON.stringify(await ui.drawn());
    expect(drawn).not.toContain("Matter:");
    expect(drawn).toContain("Timer:");
    await $.command.run({ command: "time", args: "stop", origin, presentation });
    expect(JSON.stringify(await ui.drawn())).not.toContain("Timer:");
    expect(JSON.stringify(await ui.drawn())).toContain("Right");
  });
}

test("a timer write failure is visible and the same interval can be retried", async ($, on) => {
  on("store.get", () => ({ value: undefined }));
  mock.session(on);
  const clock = mock.clock(on);
  on("session.id", () => ({ value: "s-1" }));
  const toasts: string[] = [];
  on("ui.toast", (_$, e) => {
    toasts.push(e.text);
    return { value: undefined };
  });
  let refuse = true;
  let writes = 0;
  on("store.set", (_$, e) => {
    if (refuse) return { deny: "fixture write failure" };
    writes += 1;
    expect(e.key).toBe("timer-intervals");
    return { value: undefined };
  });
  await $.command.run({ command: "time", args: "start", origin, presentation });
  await clock.advance(60_000);
  expect(JSON.stringify(await $.command.run({ command: "time", args: "stop", origin, presentation }))).toContain(
    "could not be saved"
  );
  expect(toasts.join(" ")).toContain("could not be saved");
  expect(JSON.stringify(await $.command.run({ command: "time", args: "", origin, presentation }))).toContain(
    "Timer running"
  );
  refuse = false;
  expect(JSON.stringify(await $.command.run({ command: "time", args: "stop", origin, presentation }))).toContain(
    "Interval saved"
  );
  expect(writes).toBe(1);
});

test("a failed verdict save shows an error toast", async ($, on) => {
  on("store.get", () => ({ value: undefined }));
  mock.clock(on);
  mock.session(on);
  const toasts: Array<string> = [];
  on("ui.toast", (_$, e) => {
    toasts.push(e.text);
    return { value: undefined };
  });
  on("store.set", () => ({ deny: "disk full" }));
  on("session.messages", () => ({ value: [{ role: "user", text: "Which matter is 10008US01?", toolUses: [] }] }));
  on("turn.complete", () => ({ text: "" }));
  on("session.id", () => ({ value: "s-1" }));
  await $.turn.complete({ answer: "It is 12345.10008US01.", turnId: "t-2", isAborted: false, durationMs: 10 });
  const result = await $.command.run({ command: "wrong", args: "", origin, presentation });
  expect(JSON.stringify(result)).toContain("The verdict could not be saved. Try again.");
  expect(toasts).toContain("The verdict could not be saved. Try again.");
});
