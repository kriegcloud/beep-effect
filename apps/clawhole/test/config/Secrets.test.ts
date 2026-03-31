import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  assertSecretInputResolved,
  coerceSecretRef,
  EnvSecretProviderConfig,
  ExecSecretProviderConfig,
  FileSecretProviderConfig,
  hasConfiguredSecretInput,
  isSecretRef,
  isValidEnvSecretRefId,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
  parseEnvTemplateSecretRef,
  resolveSecretInputRef,
  SecretProviderConfig,
  SecretRef,
  SecretsConfig,
  UnresolvedSecretRefError,
} from "../../src/config/Secrets.ts";

const decodeSecretRef = S.decodeUnknownSync(SecretRef);
const decodeSecretProviderConfig = S.decodeUnknownSync(SecretProviderConfig);
const decodeSecretsConfig = S.decodeUnknownSync(SecretsConfig);

describe("Secrets helpers", () => {
  it("validates env secret ref ids with the legacy uppercase rule", () => {
    expect(isValidEnvSecretRefId("OPENAI_API_KEY")).toBe(true);
    expect(isValidEnvSecretRefId("openai_api_key")).toBe(false);
    expect(isValidEnvSecretRefId("OPENAI-API-KEY")).toBe(false);
  });

  it("parses inline env templates into env secret refs", () => {
    const parsed = parseEnvTemplateSecretRef("  ${OPENAI_API_KEY}  ", "gateway");

    expect(parsed).not.toBeNull();
    expect(parsed).toMatchObject({
      source: "env",
      provider: "gateway",
      id: "OPENAI_API_KEY",
    });
  });

  it("falls back to the default provider alias for blank env template providers", () => {
    const parsed = parseEnvTemplateSecretRef("${OPENAI_API_KEY}", "   ");

    expect(parsed).not.toBeNull();
    expect(parsed).toMatchObject({
      source: "env",
      provider: "default",
      id: "OPENAI_API_KEY",
    });
  });

  it("upgrades legacy refs without providers using per-source defaults", () => {
    const fileRef = coerceSecretRef(
      {
        source: "file",
        id: "/providers/openai/apiKey",
      },
      {
        file: "mounted-json",
      }
    );

    const execRef = coerceSecretRef(
      {
        source: "exec",
        id: "openai/api-key",
      },
      {
        exec: "vault",
      }
    );

    expect(fileRef).toMatchObject({
      source: "file",
      provider: "mounted-json",
      id: "/providers/openai/apiKey",
    });
    expect(execRef).toMatchObject({
      source: "exec",
      provider: "vault",
      id: "openai/api-key",
    });
  });

  it("keeps file and exec ids permissive while env ids remain strict", () => {
    const fileRef = decodeSecretRef({
      source: "file",
      provider: "mounted-json",
      id: "/providers/openai/apiKey",
    });
    const execRef = decodeSecretRef({
      source: "exec",
      provider: "vault",
      id: "openai/api-key",
    });

    expect(fileRef).toMatchObject({
      source: "file",
      provider: "mounted-json",
      id: "/providers/openai/apiKey",
    });
    expect(execRef).toMatchObject({
      source: "exec",
      provider: "vault",
      id: "openai/api-key",
    });

    expect(() =>
      decodeSecretRef({
        source: "env",
        provider: "default",
        id: "openai_api_key",
      })
    ).toThrow();
  });

  it("rejects excess properties in the secret ref guard", () => {
    expect(
      isSecretRef({
        source: "env",
        provider: "default",
        id: "OPENAI_API_KEY",
      })
    ).toBe(true);

    expect(
      isSecretRef({
        source: "env",
        provider: "default",
        id: "OPENAI_API_KEY",
        extra: true,
      })
    ).toBe(false);
  });

  it("normalizes inline secret strings and detects configured inputs", () => {
    expect(normalizeSecretInputString("  beep  ")).toBe("beep");
    expect(normalizeSecretInputString("   ")).toBeUndefined();

    expect(hasConfiguredSecretInput("  beep  ")).toBe(true);
    expect(hasConfiguredSecretInput("${OPENAI_API_KEY}")).toBe(true);
    expect(hasConfiguredSecretInput("   ")).toBe(false);
  });

  it("prefers explicit ref values over inline refs", () => {
    const resolution = resolveSecretInputRef({
      value: "${INLINE_SECRET}",
      refValue: {
        source: "exec",
        provider: "vault",
        id: "openai/api-key",
      },
    });

    expect(resolution.explicitRef).toMatchObject({
      source: "exec",
      provider: "vault",
      id: "openai/api-key",
    });
    expect(resolution.inlineRef).toBeNull();
    expect(resolution.ref).toMatchObject({
      source: "exec",
      provider: "vault",
      id: "openai/api-key",
    });
  });

  it("fails in the effect error channel when a secret input is still unresolved", async () => {
    await expect(
      Effect.runPromise(
        assertSecretInputResolved({
          value: "${OPENAI_API_KEY}",
          path: "tts.apiKey",
        })
      )
    ).rejects.toBeInstanceOf(UnresolvedSecretRefError);

    try {
      await Effect.runPromise(
        assertSecretInputResolved({
          value: "${OPENAI_API_KEY}",
          path: "tts.apiKey",
        })
      );
    } catch (error) {
      expect(error).toBeInstanceOf(UnresolvedSecretRefError);
      expect(error).toMatchObject({
        path: "tts.apiKey",
        ref: {
          source: "env",
          provider: "default",
          id: "OPENAI_API_KEY",
        },
      });
    }
  });

  it("returns plaintext values and fails for unresolved refs when normalizing resolved secrets", async () => {
    await expect(
      Effect.runPromise(
        normalizeResolvedSecretInputString({
          value: "  beep  ",
          path: "tts.apiKey",
        })
      )
    ).resolves.toBe("beep");

    await expect(
      Effect.runPromise(
        normalizeResolvedSecretInputString({
          value: undefined,
          path: "tts.apiKey",
        })
      )
    ).resolves.toBeUndefined();

    await expect(
      Effect.runPromise(
        normalizeResolvedSecretInputString({
          value: "${OPENAI_API_KEY}",
          path: "tts.apiKey",
        })
      )
    ).rejects.toBeInstanceOf(UnresolvedSecretRefError);
  });
});

describe("Secrets schemas", () => {
  it("decodes each provider configuration variant", () => {
    const envProvider = decodeSecretProviderConfig({
      source: "env",
      allowlist: ["OPENAI_API_KEY"],
    });
    const fileProvider = decodeSecretProviderConfig({
      source: "file",
      path: "/tmp/secrets.json",
      mode: "json",
      timeoutMs: 0,
      maxBytes: 4096,
    });
    const execProvider = decodeSecretProviderConfig({
      source: "exec",
      command: "op",
      args: ["read", "op://vault/item/field"],
      timeoutMs: 5_000,
      noOutputTimeoutMs: 1_000,
      maxOutputBytes: 8_192,
      jsonOnly: true,
      env: {
        OP_ACCOUNT: "acme",
      },
      passEnv: ["HOME"],
      trustedDirs: ["/usr/local/bin"],
      allowInsecurePath: false,
      allowSymlinkCommand: false,
    });

    expect(envProvider).toBeInstanceOf(EnvSecretProviderConfig);
    expect(fileProvider).toBeInstanceOf(FileSecretProviderConfig);
    expect(execProvider).toBeInstanceOf(ExecSecretProviderConfig);
  });

  it("decodes the top-level secrets config with defaults and resolution limits", () => {
    const config = decodeSecretsConfig({
      providers: {
        default: {
          source: "env",
          allowlist: ["OPENAI_API_KEY"],
        },
        vault: {
          source: "exec",
          command: "op",
        },
      },
      defaults: {
        env: "default",
        exec: "vault",
      },
      resolution: {
        maxProviderConcurrency: 0,
        maxRefsPerProvider: 10,
        maxBatchBytes: 8192,
      },
    });

    expect(O.isSome(config.providers)).toBe(true);
    expect(O.isSome(config.defaults)).toBe(true);
    expect(O.isSome(config.resolution)).toBe(true);

    if (O.isSome(config.providers) && O.isSome(config.defaults) && O.isSome(config.resolution)) {
      expect(config.providers.value.default).toBeInstanceOf(EnvSecretProviderConfig);
      expect(config.providers.value.vault).toBeInstanceOf(ExecSecretProviderConfig);
      expect(config.defaults.value.env).toEqual(O.some("default"));
      expect(config.defaults.value.exec).toEqual(O.some("vault"));
      expect(config.resolution.value.maxProviderConcurrency).toEqual(O.some(0));
      expect(config.resolution.value.maxRefsPerProvider).toEqual(O.some(10));
      expect(config.resolution.value.maxBatchBytes).toEqual(O.some(8192));
    }
  });

  it("rejects negative numeric limits", () => {
    expect(() =>
      decodeSecretProviderConfig({
        source: "file",
        path: "/tmp/secrets.json",
        timeoutMs: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSecretsConfig({
        resolution: {
          maxProviderConcurrency: -1,
        },
      })
    ).toThrow();
  });
});
