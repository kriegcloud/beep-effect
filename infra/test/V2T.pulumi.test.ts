import { $InfraId } from "@beep/identity";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const $I = $InfraId.create("test/V2T.pulumi");

class PulumiCommandResource extends S.Class<PulumiCommandResource>($I`PulumiCommandResource`)(
  {
    environment: S.Record(S.String, S.String),
    name: S.String,
    triggersLength: S.Number,
  },
  $I.annote("PulumiCommandResource", {
    description: "Mocked local.Command resource inputs captured from the V2T workstation component.",
  })
) {}

class PulumiUnitFixtureOutputs extends S.Class<PulumiUnitFixtureOutputs>($I`PulumiUnitFixtureOutputs`)(
  {
    graphitiStateDir: S.String,
    installedPackageName: S.String,
    qwenStateDir: S.String,
  },
  $I.annote("PulumiUnitFixtureOutputs", {
    description: "Selected mocked outputs from the V2T workstation component.",
  })
) {}

class PulumiUnitFixtureResult extends S.Class<PulumiUnitFixtureResult>($I`PulumiUnitFixtureResult`)(
  {
    commandResources: S.Array(PulumiCommandResource),
    outputs: PulumiUnitFixtureOutputs,
  },
  $I.annote("PulumiUnitFixtureResult", {
    description: "Decoded JSON payload emitted by the mocked Pulumi unit fixture.",
  })
) {}

class PulumiAutomationFixtureResult extends S.Class<PulumiAutomationFixtureResult>($I`PulumiAutomationFixtureResult`)(
  {
    firstGraphitiProxyUrl: S.String.pipe(S.NullOr),
    firstInstalledPackageName: S.String,
    firstQwenStateDir: S.String,
    logAfterDestroy: S.Array(S.String),
    logAfterFirstUp: S.Array(S.String),
    logAfterPreview: S.Array(S.String),
    logAfterSecondUp: S.Array(S.String),
  },
  $I.annote("PulumiAutomationFixtureResult", {
    description: "Decoded JSON payload emitted by the Pulumi Automation API fixture.",
  })
) {}

const runFixture = async (fixturePath: string) => {
  const child = Bun.spawn(["bun", fixturePath], {
    cwd: process.cwd(),
    env: process.env,
    stderr: "pipe",
    stdout: "pipe",
  });

  const [exitCode, stderr, stdout] = await Promise.all([
    child.exited,
    new Response(child.stderr).text(),
    new Response(child.stdout).text(),
  ]);

  expect(exitCode).toBe(0);
  expect(stderr.trim()).toBe("");

  return stdout;
};

const runUnitFixture = async () =>
  S.decodeUnknownSync(S.fromJsonString(PulumiUnitFixtureResult))(await runFixture("test/fixtures/v2t-pulumi-unit.mjs"));

const runAutomationFixture = async () =>
  S.decodeUnknownSync(S.fromJsonString(PulumiAutomationFixtureResult))(
    await runFixture("test/fixtures/v2t-pulumi-automation.mjs")
  );

const pulumiFixtureTimeoutMs = 120_000;

describe("Pulumi validation", () => {
  it(
    "registers the expected local.Command resources with target-user-aware paths",
    async () => {
      const result = await runUnitFixture();

      expect(result.outputs.installedPackageName).toBe("fixture-package");
      expect(result.outputs.qwenStateDir).toBe("/home/tester/.local/share/beep/v2t-workstation/qwen");
      expect(result.outputs.graphitiStateDir).toBe("/home/tester/.local/share/beep/v2t-workstation/graphiti");

      expect(result.commandResources.map((resource) => resource.name)).toEqual([
        "fixture-preflight",
        "fixture-system",
        "fixture-qwen",
        "fixture-graphiti",
        "fixture-app",
      ]);

      const qwenCommand = result.commandResources.find((resource) => resource.name === "fixture-qwen");
      const graphitiCommand = result.commandResources.find((resource) => resource.name === "fixture-graphiti");

      expect(qwenCommand?.environment.V2T_QWEN_STATE_DIR).toBe("/home/tester/.local/share/beep/v2t-workstation/qwen");
      expect(graphitiCommand?.environment.V2T_GRAPHITI_STATE_DIR).toBe(
        "/home/tester/.local/share/beep/v2t-workstation/graphiti"
      );
    },
    pulumiFixtureTimeoutMs
  );

  it(
    "supports preview, up, no-op up, and destroy through Automation API with fixture commands",
    async () => {
      const result = await runAutomationFixture();

      expect(result.logAfterPreview).toEqual([]);
      expect(result.logAfterFirstUp.map((line) => line.split("\t")[0])).toEqual([
        "preflight",
        "install-system",
        "install-qwen",
        "build-app",
      ]);
      expect(result.logAfterSecondUp).toEqual(result.logAfterFirstUp);
      expect(result.logAfterDestroy.map((line) => line.split("\t")[0]).slice(-2)).toEqual([
        "uninstall-app",
        "uninstall-qwen",
      ]);

      expect(result.firstInstalledPackageName).toBe("fixture-package");
      expect(result.firstGraphitiProxyUrl).toBeNull();
      expect(result.firstQwenStateDir).toBe("/home/fixture-user/.local/share/beep/v2t-workstation/qwen");
    },
    pulumiFixtureTimeoutMs
  );
});
