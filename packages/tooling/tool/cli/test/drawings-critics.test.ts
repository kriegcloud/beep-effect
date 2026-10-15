import {
  CriticFinding,
  CriticFindingRelation,
  CriticPackRequest,
  CriticReport,
  CriticReportSource,
  CriticReviewer,
  CriticRunRequest,
  CriticZoom,
  criticInvocation,
  criticReportJsonSchema,
  DEFAULT_CRITIC_REVIEWERS,
  DrawingsCommandError,
  decodeCriticReport,
  extractReportText,
  parseZoomFlag,
  priorIdsMarkdown,
  priorSummaryMarkdown,
  selectReviewers,
  strokeTableMarkdown,
} from "@beep/repo-cli/commands/Drawings";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertExitFailure, assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const UnknownJson = S.fromJsonString(S.Unknown);
const encodeJson = S.encodeUnknownEffect(UnknownJson);
const decodeJson = S.decodeUnknownEffect(UnknownJson);

const accept = (reviewer: string): CriticReport =>
  CriticReport.make({
    reviewer,
    verdict: "accept",
    blockers: [],
    priorAssessment: [],
    findings: [],
    couldNotAssess: [],
  });

const finding = (id: string, of: O.Option<string> = O.none()): CriticFinding =>
  CriticFinding.make({
    id,
    relation: CriticFindingRelation.make({ kind: O.isSome(of) ? "extends" : "new", of }),
    severity: "P1",
    scope: "this-render",
    category: "shading",
    figures: [2, 4],
    location: "left wall, strokes at x = 111.2 mm",
    basis: "37 CFR 1.84(m)",
    observation: "The band sits at the lit end.",
    proposedFix: "Anchor the band at the shadow end.",
    confidence: 0.9,
  });

describe("critic report contract", () => {
  it.effect("round-trips a report with a new and an extending finding through JSON", () =>
    Effect.gen(function* () {
      const report = CriticReport.make({
        ...accept("grok-4.7"),
        priorAssessment: [{ id: "A-01", stance: "confirm", note: "Measured 1.50 mm." }],
        findings: [finding("G-01"), finding("G-02", O.some("A-01"))],
      });
      const text = yield* encodeJson({
        reviewer: "grok-4.7",
        verdict: "accept",
        blockers: [],
        priorAssessment: [{ id: "A-01", stance: "confirm", note: "Measured 1.50 mm." }],
        findings: [
          { ...finding("G-01"), relation: { kind: "new", of: null } },
          { ...finding("G-02"), relation: { kind: "extends", of: "A-01" } },
        ],
        couldNotAssess: [],
      });
      const decoded = yield* decodeCriticReport(text);
      expect(decoded).toStrictEqual(report);
      assertNone(decoded.findings[0]?.relation.of ?? O.none());
      assertSome(decoded.findings[1]?.relation.of ?? O.none(), "A-01");
    })
  );

  it.effect("derives a JSON Schema in which every key is required and no excess property is allowed", () =>
    Effect.gen(function* () {
      const schema = yield* decodeJson(criticReportJsonSchema());
      expect(schema).toHaveProperty("required", [
        "reviewer",
        "verdict",
        "blockers",
        "priorAssessment",
        "findings",
        "couldNotAssess",
      ]);
      expect(schema).toHaveProperty("additionalProperties", false);
      expect(schema).toHaveProperty("properties.findings.items.required", expect.arrayContaining(["relation"]));
      // The strict structured-output modes refuse an optional key; `of` is required and nullable.
      expect(schema).toHaveProperty("properties.findings.items.properties.relation.required", ["kind", "of"]);
      expect(criticReportJsonSchema()).not.toMatch(/"(allOf|minLength|title|minimum|maximum|\$ref)"/);
    })
  );

  it.effect("rejects a report whose finding carries an unknown category", () =>
    Effect.gen(function* () {
      const text = yield* encodeJson({
        ...accept("x"),
        findings: [{ ...finding("X-01"), relation: { kind: "new", of: null }, category: "taste" }],
      });
      const exit = yield* Effect.exit(decodeCriticReport(text));
      // The decoder fails on exactly the offending key, naming the category domain it expected.
      assertSome(
        O.map(Exit.findErrorOption(exit), (error) => error.message),
        'Expected @beep/repo-cli/commands/Drawings/Drawings.critics.schemas/CriticCategory\n  at ["findings"][0]["category"]'
      );
    })
  );
});

describe("extractReportText", () => {
  const document = '{"reviewer":"x","verdict":"accept"}';

  it.effect("reads a Grok wrapper's structuredOutput, or its text when absent", () =>
    Effect.gen(function* () {
      assertSome(
        extractReportText({
          route: "grok",
          text: yield* encodeJson({ text: "", structuredOutput: { reviewer: "x", verdict: "accept" } }),
        }),
        document
      );
      assertSome(
        extractReportText({ route: "grok", text: yield* encodeJson({ text: `Here: ${document}` }) }),
        document
      );
    })
  );

  it.effect("reads the last result event of a claude -p stream-json array", () =>
    Effect.gen(function* () {
      const events = yield* encodeJson([
        { type: "system", subtype: "init" },
        { type: "result", result: "not this one {}" },
        { type: "result", result: `Final:\n${document}\n` },
      ]);
      assertSome(extractReportText({ route: "claude", text: events }), document);
    })
  );

  it("reads the outermost braces of cursor and codex text, and none when there are none", () => {
    assertSome(extractReportText({ route: "cursor", text: `prose ${document} trailing` }), document);
    assertSome(extractReportText({ route: "codex", text: document }), document);
    assertNone(extractReportText({ route: "cursor", text: "no json here" }));
  });
});

describe("prior summaries", () => {
  it("lists every finding, stance and could-not-assess line of the earlier reviewers", () => {
    const reports = [
      CriticReport.make({
        ...accept("codex-gpt-6-astra"),
        findings: [finding("A-01")],
        couldNotAssess: ["No Guide pages."],
      }),
      CriticReport.make({
        ...accept("grok-4.7"),
        priorAssessment: [{ id: "A-01", stance: "refute", note: "Measured 2.1 mm." }],
      }),
    ];
    const summary = priorSummaryMarkdown(reports);
    expect(summary).toContain("**A-01** P1 this-render shading FIG [2,4]");
    expect(summary).toContain("on A-01: refute — Measured 2.1 mm.");
    expect(summary).toContain("could_not_assess: No Guide pages.");
  });

  it("gives a synthetic-scope reviewer ids and categories only", () => {
    const ids = priorIdsMarkdown([CriticReport.make({ ...accept("codex-gpt-6-astra"), findings: [finding("A-01")] })]);
    expect(ids).toContain("- A-01 P1 shading — basis: 37 CFR 1.84(m)");
    expect(ids).not.toContain("111.2 mm");
  });
});

describe("stroke table", () => {
  it("measures every shading stroke of a figure SVG in mm with its direction, offset and length", () => {
    // Two vertical strokes 1.5 mm apart (in PDF points: 1.5 mm = 4.2520 pt) and one horizontal stroke.
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="612pt" height="792pt">',
      '<path id="label-outlines" d="M1 1L2 2"/>',
      '<path stroke-width="0.567" d="M283.465 283.465L283.465 311.811M287.717 283.465L287.717 311.811M283.465 340.157L311.811 340.157"/>',
      '<path stroke-width="0.992" d="M0 0L10 10"/>',
      "</svg>",
    ].join("");
    const table = strokeTableMarkdown({
      title: "Crate",
      sheetSetSha256: "0".repeat(64),
      specSha256: "1".repeat(64),
      figures: [{ figure: 1, view: "front", svg, coverage: "{}" }],
    });
    expect(table).toContain("FIG 1 (front) — 3 shading strokes");
    expect(table).toContain("| 0 | 120 | 10 | 100 | 120 | 110 | 120 |");
    expect(table).toContain("| 90 | 100 | 10 | 100 | 100 | 100 | 110 |");
    expect(table).toContain("| 90 | 101.5 | 10 | 101.5 | 100 | 101.5 | 110 |");
  });
});

describe("invocations", () => {
  const env = { HOME: "/home/x", CLAUDECODE: "1", ANTHROPIC_BASE_URL: "http://proxy" };
  const base = {
    packDir: "/pack",
    prompt: "review",
    images: ["/pack/render/pg-1.png"],
    schemaPath: "/pack/findings.schema.json",
    schemaText: "{}",
    reportPath: "/loop/r.json",
    workspace: O.some("/lane"),
    syntheticPack: O.some("/crate"),
    env,
  };

  it("builds the four routes with their model, effort, read-only mode and report source", () => {
    const byName = (name: string) => A.findFirst(DEFAULT_CRITIC_REVIEWERS, (r) => r.name === name);
    const astra = criticInvocation({ ...base, reviewer: O.getOrThrow(byName("codex-gpt-6-astra")) });
    expect(astra.executable).toBe("codex");
    expect(astra.args).toContain('model_reasoning_effort="xhigh"');
    expect(astra.args).toContain("read-only");
    expect(astra.args).toContain("/pack/render/pg-1.png");
    // codex writes its report to the file it was handed; the other routes print it on stdout
    expect(astra.reportFrom).toStrictEqual(CriticReportSource.cases.file.make({ kind: "file", path: base.reportPath }));
    const grok = criticInvocation({ ...base, reviewer: O.getOrThrow(byName("grok-4.7")) });
    expect(grok.args).toContain("--json-schema");
    expect(grok.reportFrom).toStrictEqual(CriticReportSource.cases.stdout.make({ kind: "stdout" }));
    const fable = criticInvocation({ ...base, reviewer: O.getOrThrow(byName("claude-fable-5.1")) });
    expect(fable.args).toContain("claude-fable-5-1");
    expect(fable.env).toStrictEqual({ HOME: "/home/x" });
    const kimi = criticInvocation({ ...base, reviewer: O.getOrThrow(byName("kimi-k3")) });
    expect(kimi.cwd).toBe("/lane");
    expect(kimi.args).toContain("--add-dir");
    expect(kimi.args).toContain("/crate");
    expect(kimi.args).toContain("enabled");
    expect(kimi.args).not.toContain("disabled");
  });

  it("confines lower-trust Grok and Claude critics to read-only tools", () => {
    const byName = (name: string) =>
      O.getOrThrow(A.findFirst(DEFAULT_CRITIC_REVIEWERS, (reviewer) => reviewer.name === name));
    const flagValue = (args: ReadonlyArray<string>, flag: string) =>
      args[O.getOrThrow(A.findFirstIndex(args, (arg) => arg === flag)) + 1];
    const grok = criticInvocation({ ...base, reviewer: byName("grok-4.7") });
    expect(flagValue(grok.args, "--permission-mode")).toBe("dontAsk");
    expect(flagValue(grok.args, "--sandbox")).toBe("strict");
    expect(A.zip(grok.args, A.drop(grok.args, 1))).toEqual(
      expect.arrayContaining([
        ["--allow", "Read"],
        ["--allow", "Grep"],
        ["--deny", "Bash"],
        ["--deny", "Edit"],
        ["--deny", "MCPTool"],
        ["--deny", "WebFetch"],
        ["--deny", "WebSearch"],
      ])
    );
    expect(grok.args).toEqual(expect.arrayContaining(["--disable-web-search", "--no-subagents", "--no-memory"]));
    expect(grok.args).not.toContain("bypassPermissions");

    const claude = criticInvocation({ ...base, reviewer: byName("claude-fable-5.1") });
    expect(flagValue(claude.args, "--permission-mode")).toBe("dontAsk");
    expect(flagValue(claude.args, "--permission-prompts")).toBe("none");
    expect(flagValue(claude.args, "--tools")).toBe("Read");
    expect(claude.args).toContain("--restricted");
    expect(claude.args).not.toContain("bypassPermissions");
  });

  it.effect("selects reviewers by name in the order given and refuses an unknown one", () =>
    Effect.gen(function* () {
      const two = yield* selectReviewers(["claude-opus-5.5", "grok-4.7"]);
      expect(A.map(two, (r) => r.idPrefix)).toStrictEqual(["O", "G"]);
      const unknown = yield* Effect.exit(selectReviewers(["gpt-3"]));
      assertExitFailure(
        unknown,
        Cause.fail(
          DrawingsCommandError.make({
            message:
              '"gpt-3" is not a known reviewer; known: codex-gpt-6-astra, grok-4.7, claude-fable-5.1, kimi-k3, claude-opus-5.5.',
          })
        )
      );
    })
  );

  it.effect("parses a zoom flag and refuses a malformed one", () =>
    Effect.gen(function* () {
      const zoom = yield* parseZoomFlag("1:500,1500,1700,1400:walls");
      expect([zoom.figure, zoom.x, zoom.y, zoom.width, zoom.height, zoom.label]).toStrictEqual([
        1,
        500,
        1500,
        1700,
        1400,
        "walls",
      ]);
      const bad = yield* Effect.exit(parseZoomFlag("1:500,1500:walls"));
      assertExitFailure(
        bad,
        Cause.fail(DrawingsCommandError.make({ message: '"1:500,1500:walls" is not fig:x,y,width,height:label.' }))
      );
    })
  );

  it("names a reviewer's model and scope in the default sequence", () => {
    const kimi = A.findFirst(DEFAULT_CRITIC_REVIEWERS, (r) => r.route === "cursor");
    assertSome(
      O.map(kimi, (r) => r.scope),
      "synthetic"
    );
    expect(A.map(DEFAULT_CRITIC_REVIEWERS, (r) => r.idPrefix)).toStrictEqual(["A", "G", "F", "K", "O"]);
    assertNone(
      CriticReviewer.make({ name: "x", idPrefix: "X", route: "grok", model: "grok-4.7", scope: "matter" }).effort
    );
  });

  it("builds pack and run requests through their schemas, absent directories as none", () => {
    const pack = CriticPackRequest.make({
      manifestPath: "render/manifest.json",
      outDir: "packs/loop-1",
      briefPath: "BRIEF.md",
      imagesDirs: ["markup"],
      zooms: [CriticZoom.make({ figure: 1, label: "walls", x: 500, y: 1500, width: 1700, height: 1400 })],
    });
    assertNone(pack.contextDir);
    const run = CriticRunRequest.make({
      loop: 2,
      loopDir: "loops/2",
      packDir: "packs/loop-1",
      reviewers: DEFAULT_CRITIC_REVIEWERS,
      timeoutMinutes: 90,
    });
    assertNone(run.workspace);
    assertNone(run.syntheticPack);
    // loop numbers and timeouts start at 1, as the loop record requires
    assertNone(CriticRunRequest.makeOption({ ...run, loop: 0 }));
    assertNone(CriticRunRequest.makeOption({ ...run, timeoutMinutes: 0 }));
  });
});
