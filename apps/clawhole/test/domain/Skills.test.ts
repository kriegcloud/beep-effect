import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  SkillConfig,
  SkillsConfig,
  SkillsInstallConfig,
  SkillsLimitsConfig,
  SkillsLoadConfig,
  SkillsNodeManager,
} from "../../src/domain/Skills.ts";

const strictParseOptions = { onExcessProperty: "error" } as const;

const decodeSkillConfig = S.decodeUnknownSync(SkillConfig);
const decodeSkillsLoadConfig = S.decodeUnknownSync(SkillsLoadConfig);
const decodeSkillsNodeManager = S.decodeUnknownSync(SkillsNodeManager);
const decodeSkillsInstallConfig = S.decodeUnknownSync(SkillsInstallConfig);
const decodeSkillsLimitsConfig = S.decodeUnknownSync(SkillsLimitsConfig);
const decodeSkillsConfig = S.decodeUnknownSync(SkillsConfig);

describe("Skills config schemas", () => {
  it("decodes a fully populated top-level skills config", () => {
    const config = decodeSkillsConfig({
      allowBundled: ["repo-skill", "shared-skill"],
      load: {
        extraDirs: ["/workspace/.agents/skills", "/opt/company-skills"],
        watch: true,
        watchDebounceMs: 250,
      },
      install: {
        preferBrew: true,
        nodeManager: "pnpm",
      },
      limits: {
        maxCandidatesPerRoot: 5,
        maxSkillsLoadedPerSource: 25,
        maxSkillsInPrompt: 10,
        maxSkillsPromptChars: 4_000,
        maxSkillFileBytes: 8_192,
      },
      entries: {
        "repo-skill": {
          enabled: true,
          apiKey: {
            source: "env",
            provider: "default",
            id: "OPENAI_API_KEY",
          },
          env: {
            OPENAI_BASE_URL: "https://api.openai.com/v1",
          },
          config: {
            retries: 3,
            enabledProfiles: ["default"],
          },
        },
      },
    });

    expect(config).toBeInstanceOf(SkillsConfig);
    expect(config.allowBundled).toEqual(O.some(["repo-skill", "shared-skill"]));

    expect(O.isSome(config.load)).toBe(true);
    expect(O.isSome(config.install)).toBe(true);
    expect(O.isSome(config.limits)).toBe(true);
    expect(O.isSome(config.entries)).toBe(true);

    if (O.isSome(config.load)) {
      expect(config.load.value).toBeInstanceOf(SkillsLoadConfig);
      expect(config.load.value.watch).toEqual(O.some(true));
      expect(config.load.value.watchDebounceMs).toEqual(O.some(250));
    }

    if (O.isSome(config.install)) {
      expect(config.install.value).toBeInstanceOf(SkillsInstallConfig);
      expect(config.install.value.preferBrew).toEqual(O.some(true));
      expect(config.install.value.nodeManager).toEqual(O.some("pnpm"));
    }

    if (O.isSome(config.limits)) {
      expect(config.limits.value).toBeInstanceOf(SkillsLimitsConfig);
      expect(config.limits.value.maxCandidatesPerRoot).toEqual(O.some(5));
      expect(config.limits.value.maxSkillFileBytes).toEqual(O.some(8_192));
    }

    if (O.isSome(config.entries)) {
      const repoSkill = config.entries.value["repo-skill"];

      expect(repoSkill).toBeInstanceOf(SkillConfig);
      expect(repoSkill?.enabled).toEqual(O.some(true));
      expect(repoSkill?.env).toEqual(
        O.some({
          OPENAI_BASE_URL: "https://api.openai.com/v1",
        })
      );
      expect(repoSkill?.config).toEqual(
        O.some({
          retries: 3,
          enabledProfiles: ["default"],
        })
      );
      expect(O.isSome(repoSkill?.apiKey ?? O.none())).toBe(true);
    }
  });

  it("keeps omitted top-level and nested fields unset", () => {
    const config = decodeSkillsConfig({});
    const entry = decodeSkillConfig({});
    const load = decodeSkillsLoadConfig({});
    const install = decodeSkillsInstallConfig({});
    const limits = decodeSkillsLimitsConfig({});

    expect(config).toBeInstanceOf(SkillsConfig);
    expect(config.allowBundled).toEqual(O.none());
    expect(config.load).toEqual(O.none());
    expect(config.install).toEqual(O.none());
    expect(config.limits).toEqual(O.none());
    expect(config.entries).toEqual(O.none());

    expect(entry.enabled).toEqual(O.none());
    expect(entry.apiKey).toEqual(O.none());
    expect(entry.env).toEqual(O.none());
    expect(entry.config).toEqual(O.none());

    expect(load.extraDirs).toEqual(O.none());
    expect(load.watch).toEqual(O.none());
    expect(load.watchDebounceMs).toEqual(O.none());

    expect(install.preferBrew).toEqual(O.none());
    expect(install.nodeManager).toEqual(O.none());

    expect(limits.maxCandidatesPerRoot).toEqual(O.none());
    expect(limits.maxSkillsLoadedPerSource).toEqual(O.none());
    expect(limits.maxSkillsInPrompt).toEqual(O.none());
    expect(limits.maxSkillsPromptChars).toEqual(O.none());
    expect(limits.maxSkillFileBytes).toEqual(O.none());
  });

  it("accepts supported node managers and rejects unsupported values", () => {
    expect(decodeSkillsNodeManager("npm")).toBe("npm");
    expect(decodeSkillsNodeManager("pnpm")).toBe("pnpm");
    expect(decodeSkillsNodeManager("yarn")).toBe("yarn");
    expect(decodeSkillsNodeManager("bun")).toBe("bun");

    expect(() => decodeSkillsNodeManager("corepack")).toThrow();
    expect(() =>
      decodeSkillsInstallConfig({
        nodeManager: "corepack",
      })
    ).toThrow();
  });

  it("enforces upstream integer bounds for load and limits settings", () => {
    expect(
      decodeSkillsLoadConfig({
        watchDebounceMs: 0,
      }).watchDebounceMs
    ).toEqual(O.some(0));

    expect(
      decodeSkillsLimitsConfig({
        maxCandidatesPerRoot: 1,
        maxSkillsLoadedPerSource: 1,
        maxSkillsInPrompt: 0,
        maxSkillsPromptChars: 0,
        maxSkillFileBytes: 0,
      }).maxSkillFileBytes
    ).toEqual(O.some(0));

    expect(() =>
      decodeSkillsLoadConfig({
        watchDebounceMs: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig({
        maxCandidatesPerRoot: 0,
      })
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig({
        maxSkillsLoadedPerSource: 0,
      })
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig({
        maxSkillsInPrompt: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig({
        maxSkillsPromptChars: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig({
        maxSkillFileBytes: -1,
      })
    ).toThrow();
  });

  it("rejects excess properties in strict decoding mode", () => {
    expect(() =>
      decodeSkillConfig(
        {
          enabled: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeSkillsLoadConfig(
        {
          watch: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeSkillsInstallConfig(
        {
          nodeManager: "pnpm",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeSkillsLimitsConfig(
        {
          maxSkillFileBytes: 1024,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeSkillsConfig(
        {
          load: {
            watch: true,
          },
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
