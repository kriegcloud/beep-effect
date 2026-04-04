import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  PluginEntryConfig,
  PluginHooksConfig,
  PluginInstallClawhubChannel,
  PluginInstallClawhubFamily,
  PluginInstallRecord,
  PluginSlotsConfig,
  PluginSubagentConfig,
  PluginsConfig,
  PluginsLoadConfig,
} from "../../src/config/Plugins.ts";

const strictParseOptions = { onExcessProperty: "error" } as const;

const decodePluginsConfig = S.decodeUnknownSync(PluginsConfig);
const decodePluginEntryConfig = S.decodeUnknownSync(PluginEntryConfig);
const decodePluginHooksConfig = S.decodeUnknownSync(PluginHooksConfig);
const decodePluginSubagentConfig = S.decodeUnknownSync(PluginSubagentConfig);
const decodePluginSlotsConfig = S.decodeUnknownSync(PluginSlotsConfig);
const decodePluginsLoadConfig = S.decodeUnknownSync(PluginsLoadConfig);
const decodePluginInstallRecord = S.decodeUnknownSync(PluginInstallRecord);
const decodePluginInstallClawhubFamily = S.decodeUnknownSync(PluginInstallClawhubFamily);
const decodePluginInstallClawhubChannel = S.decodeUnknownSync(PluginInstallClawhubChannel);

describe("Plugins config schemas", () => {
  it("decodes a minimal plugins config with omitted top-level fields as Option.none", () => {
    const decoded = decodePluginsConfig({});

    expect(decoded).toBeInstanceOf(PluginsConfig);
    expect(decoded.enabled).toEqual(O.none());
    expect(decoded.allow).toEqual(O.none());
    expect(decoded.deny).toEqual(O.none());
    expect(decoded.load).toEqual(O.none());
    expect(decoded.slots).toEqual(O.none());
    expect(decoded.entries).toEqual(O.none());
    expect(decoded.installs).toEqual(O.none());
  });

  it("decodes valid nested plugin settings and preserves allowedModels as provided", () => {
    const decoded = decodePluginsConfig({
      enabled: true,
      allow: ["voice-call", "memory-plugin"],
      deny: ["legacy-plugin"],
      load: {
        paths: ["/tmp/plugins", "./extensions"],
      },
      slots: {
        memory: "memory-plugin",
        contextEngine: "context-engine-plugin",
      },
      entries: {
        "voice-call": {
          enabled: true,
          hooks: {
            allowPromptInjection: false,
          },
          subagent: {
            allowModelOverride: true,
            allowedModels: [" anthropic/claude-haiku-4-5 ", "*"],
          },
          config: {
            retries: 2,
            nested: {
              enabled: true,
            },
            providers: ["discord"],
          },
        },
      },
      installs: {
        "voice-call": {
          source: "marketplace",
          installPath: "/tmp/voice-call",
          marketplaceName: "Official Claude Plugins",
          marketplaceSource: "github.com/acme/marketplace",
          marketplacePlugin: "voice-call",
          resolvedAt: "2026-04-03T00:00:00.000Z",
        },
      },
    });

    expect(decoded.enabled).toEqual(O.some(true));
    expect(decoded.allow).toEqual(O.some(["voice-call", "memory-plugin"]));
    expect(decoded.deny).toEqual(O.some(["legacy-plugin"]));

    expect(O.isSome(decoded.load)).toBe(true);
    if (O.isSome(decoded.load)) {
      expect(decoded.load.value).toBeInstanceOf(PluginsLoadConfig);
      expect(decoded.load.value.paths).toEqual(O.some(["/tmp/plugins", "./extensions"]));
    }

    expect(O.isSome(decoded.slots)).toBe(true);
    if (O.isSome(decoded.slots)) {
      expect(decoded.slots.value).toBeInstanceOf(PluginSlotsConfig);
      expect(decoded.slots.value.memory).toEqual(O.some("memory-plugin"));
      expect(decoded.slots.value.contextEngine).toEqual(O.some("context-engine-plugin"));
    }

    expect(O.isSome(decoded.entries)).toBe(true);
    if (O.isSome(decoded.entries)) {
      const voiceCall = decoded.entries.value["voice-call"];

      expect(voiceCall).toBeInstanceOf(PluginEntryConfig);
      expect(voiceCall.enabled).toEqual(O.some(true));
      expect(voiceCall.config).toEqual(
        O.some({
          retries: 2,
          nested: {
            enabled: true,
          },
          providers: ["discord"],
        })
      );

      expect(O.isSome(voiceCall.hooks)).toBe(true);
      if (O.isSome(voiceCall.hooks)) {
        expect(voiceCall.hooks.value).toBeInstanceOf(PluginHooksConfig);
        expect(voiceCall.hooks.value.allowPromptInjection).toEqual(O.some(false));
      }

      expect(O.isSome(voiceCall.subagent)).toBe(true);
      if (O.isSome(voiceCall.subagent)) {
        expect(voiceCall.subagent.value).toBeInstanceOf(PluginSubagentConfig);
        expect(voiceCall.subagent.value.allowModelOverride).toEqual(O.some(true));
        expect(voiceCall.subagent.value.allowedModels).toEqual(O.some([" anthropic/claude-haiku-4-5 ", "*"]));
      }
    }

    expect(O.isSome(decoded.installs)).toBe(true);
    if (O.isSome(decoded.installs)) {
      const install = decoded.installs.value["voice-call"];

      expect(install).toBeInstanceOf(PluginInstallRecord);
      expect(install.source).toBe("marketplace");
      expect(install.marketplaceName).toEqual(O.some("Official Claude Plugins"));
      expect(install.marketplaceSource).toEqual(O.some("github.com/acme/marketplace"));
      expect(install.marketplacePlugin).toEqual(O.some("voice-call"));
      expect(install.installPath).toEqual(O.some("/tmp/voice-call"));
    }
  });

  it("decodes classic and marketplace install records", () => {
    const clawhubInstall = decodePluginInstallRecord({
      source: "clawhub",
      clawhubUrl: "https://clawhub.dev/pkg/memory-plugin",
      clawhubPackage: "memory-plugin",
      clawhubFamily: "code-plugin",
      clawhubChannel: "official",
    });

    const marketplaceInstall = decodePluginInstallRecord({
      source: "marketplace",
      marketplaceName: "Community Plugins",
      marketplaceSource: "git@github.com:acme/plugins.git",
      marketplacePlugin: "voice-call",
    });

    expect(clawhubInstall.source).toBe("clawhub");
    expect(clawhubInstall.clawhubUrl).toEqual(O.some("https://clawhub.dev/pkg/memory-plugin"));
    expect(clawhubInstall.clawhubPackage).toEqual(O.some("memory-plugin"));
    expect(clawhubInstall.clawhubFamily).toEqual(O.some("code-plugin"));
    expect(clawhubInstall.clawhubChannel).toEqual(O.some("official"));

    expect(marketplaceInstall.source).toBe("marketplace");
    expect(marketplaceInstall.marketplaceName).toEqual(O.some("Community Plugins"));
    expect(marketplaceInstall.marketplaceSource).toEqual(O.some("git@github.com:acme/plugins.git"));
    expect(marketplaceInstall.marketplacePlugin).toEqual(O.some("voice-call"));
  });

  it("accepts only documented clawhub family and channel literals", () => {
    expect(decodePluginInstallClawhubFamily("code-plugin")).toBe("code-plugin");
    expect(decodePluginInstallClawhubFamily("bundle-plugin")).toBe("bundle-plugin");
    expect(() => decodePluginInstallClawhubFamily("service-plugin")).toThrow();

    expect(decodePluginInstallClawhubChannel("official")).toBe("official");
    expect(decodePluginInstallClawhubChannel("community")).toBe("community");
    expect(decodePluginInstallClawhubChannel("private")).toBe("private");
    expect(() => decodePluginInstallClawhubChannel("beta")).toThrow();
  });

  it("rejects invalid source and nested field types", () => {
    expect(() =>
      decodePluginsConfig({
        allow: [1],
      })
    ).toThrow();

    expect(() =>
      decodePluginEntryConfig({
        hooks: {
          allowPromptInjection: "no",
        },
      })
    ).toThrow();

    expect(() =>
      decodePluginEntryConfig({
        subagent: {
          allowModelOverride: "yes",
          allowedModels: [1],
        },
      })
    ).toThrow();

    expect(() =>
      decodePluginInstallRecord({
        source: "git",
      })
    ).toThrow();
  });

  it("rejects excess properties in strict mode across all plugin config objects", () => {
    expect(() =>
      decodePluginsConfig(
        {
          enabled: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginsLoadConfig(
        {
          paths: ["/tmp/plugins"],
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginSlotsConfig(
        {
          memory: "memory-plugin",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginHooksConfig(
        {
          allowPromptInjection: false,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginSubagentConfig(
        {
          allowModelOverride: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginEntryConfig(
        {
          enabled: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginEntryConfig(
        {
          hooks: {
            allowPromptInjection: false,
            extra: true,
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginEntryConfig(
        {
          subagent: {
            allowModelOverride: true,
            extra: true,
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodePluginInstallRecord(
        {
          source: "npm",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
