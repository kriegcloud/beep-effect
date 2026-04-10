import { userInfo } from "node:os";
import { describe, expect, it } from "vitest";
import {
  normalizeV2TWorkstationConfig,
  V2TGraphitiSecretError,
  V2TWorkstationConfigError,
  validateV2TWorkstationConfig,
} from "../src/V2T.js";

describe("normalizeV2TWorkstationConfig", () => {
  it("applies the local workstation defaults", () => {
    const config = normalizeV2TWorkstationConfig({
      graphitiEnabled: false,
      repoRoot: "/tmp/beep-effect",
      targetHomeDir: "/tmp/home",
      targetUser: "tester",
    });

    expect(config.repoRoot).toBe("/tmp/beep-effect");
    expect(config.graphitiEnabled).toBe(false);
    expect(config.qwenModelId).toBe("Qwen/Qwen2-Audio-7B-Instruct");
    expect(config.qwenBaseUrl).toBe("http://127.0.0.1:8011");
    expect(config.targetHomeDir).toBe("/tmp/home");
    expect(config.localBackendDir).toContain(".pulumi-local/v2t-workstation");
  });

  it("auto-disables Graphiti when no secret is present", () => {
    const config = normalizeV2TWorkstationConfig(
      {
        repoRoot: "/tmp/beep-effect",
        targetHomeDir: "/tmp/home",
        targetUser: "tester",
      },
      {
        graphitiSecretPresent: false,
      }
    );

    expect(config.graphitiEnabled).toBe(false);
  });

  it("does not auto-enable Graphiti when a secret is present", () => {
    const config = normalizeV2TWorkstationConfig(
      {
        repoRoot: "/tmp/beep-effect",
        targetHomeDir: "/tmp/home",
        targetUser: "tester",
      },
      {
        graphitiSecretPresent: true,
      }
    );

    expect(config.graphitiEnabled).toBe(false);
  });

  it("requires targetHomeDir when the target user differs from the current user", () => {
    const differentUser = `${userInfo().username}-other`;

    expect(() =>
      normalizeV2TWorkstationConfig({
        repoRoot: "/tmp/beep-effect",
        targetUser: differentUser,
      })
    ).toThrow(V2TWorkstationConfigError);
  });

  it("rejects invalid qwenBaseUrl values through the config error boundary", () => {
    expect(() =>
      normalizeV2TWorkstationConfig({
        repoRoot: "/tmp/beep-effect",
        targetHomeDir: "/tmp/home",
        targetUser: "tester",
        qwenBaseUrl: "not-a-url",
      })
    ).toThrow(V2TWorkstationConfigError);
  });
});

describe("validateV2TWorkstationConfig", () => {
  it("rejects an enabled Graphiti stack without a secret", () => {
    const config = normalizeV2TWorkstationConfig({
      graphitiEnabled: true,
      targetHomeDir: "/tmp/home",
      targetUser: "tester",
      repoRoot: "/tmp/beep-effect",
    });

    expect(() => validateV2TWorkstationConfig(config)).toThrow(V2TGraphitiSecretError);
  });

  it("allows Graphiti when a secret reference is present", () => {
    const config = normalizeV2TWorkstationConfig({
      graphitiEnabled: true,
      targetHomeDir: "/tmp/home",
      targetUser: "tester",
      repoRoot: "/tmp/beep-effect",
    });

    expect(() =>
      validateV2TWorkstationConfig(config, {
        graphitiOpenAiApiKey: "secret-ref",
      })
    ).not.toThrow();
  });
});

describe("@beep/infra package imports", () => {
  it("loads the package root without executing the stack entrypoint", async () => {
    const mod = await import("@beep/infra");

    expect(mod.infraProjectName).toBe("beep-effect");
    expect(typeof mod.V2TWorkstation).toBe("function");
  });

  it("loads the V2T subpath export", async () => {
    const mod = await import("@beep/infra/V2T");

    expect(typeof mod.V2TWorkstation).toBe("function");
    expect(typeof mod.normalizeV2TWorkstationConfig).toBe("function");
  });
});
