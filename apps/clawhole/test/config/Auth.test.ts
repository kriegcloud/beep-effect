import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { AuthConfig, AuthCooldownsConfig, AuthProfileConfig } from "../../src/config/Auth.ts";

const strictParseOptions = { onExcessProperty: "error" } as const;

const decodeAuthConfig = S.decodeUnknownSync(AuthConfig);
const decodeAuthProfileConfig = S.decodeUnknownSync(AuthProfileConfig);
const decodeAuthCooldownsConfig = S.decodeUnknownSync(AuthCooldownsConfig);

describe("Auth config schemas", () => {
  it("decodes valid auth config values and normalizes optional fields to Option", () => {
    const decoded = decodeAuthConfig({
      profiles: {
        primary: {
          provider: "Anthropic",
          mode: "oauth",
          displayName: "Primary Anthropic",
        },
        backup: {
          provider: "OpenAI",
          mode: "token",
          email: "backup@example.com",
        },
      },
      order: {
        Anthropic: ["primary"],
        OpenAI: ["backup"],
      },
      cooldowns: {
        billingBackoffHours: 5,
        billingBackoffHoursByProvider: {
          Anthropic: 2,
        },
        billingMaxHours: 24,
      },
    });

    expect(O.isSome(decoded.profiles)).toBe(true);
    expect(O.isSome(decoded.order)).toBe(true);
    expect(O.isSome(decoded.cooldowns)).toBe(true);

    if (O.isSome(decoded.profiles)) {
      const primary = decoded.profiles.value.primary;
      const backup = decoded.profiles.value.backup;

      expect(primary.provider).toBe("Anthropic");
      expect(primary.mode).toBe("oauth");
      expect(O.isSome(primary.displayName)).toBe(true);
      expect(O.isNone(primary.email)).toBe(true);

      expect(backup.provider).toBe("OpenAI");
      expect(backup.mode).toBe("token");
      expect(O.isSome(backup.email)).toBe(true);
      expect(O.isNone(backup.displayName)).toBe(true);
    }

    if (O.isSome(decoded.order)) {
      expect(decoded.order.value.Anthropic).toEqual(["primary"]);
      expect(decoded.order.value.OpenAI).toEqual(["backup"]);
    }

    if (O.isSome(decoded.cooldowns)) {
      expect(O.isSome(decoded.cooldowns.value.billingBackoffHours)).toBe(true);
      expect(O.isSome(decoded.cooldowns.value.billingBackoffHoursByProvider)).toBe(true);
      expect(O.isSome(decoded.cooldowns.value.billingMaxHours)).toBe(true);
      expect(O.isNone(decoded.cooldowns.value.failureWindowHours)).toBe(true);
    }
  });

  it("keeps omitted top-level and nested cooldown fields unset instead of injecting defaults", () => {
    const decoded = decodeAuthConfig({
      profiles: {
        primary: {
          provider: "Anthropic",
          mode: "api_key",
        },
      },
    });

    expect(O.isSome(decoded.profiles)).toBe(true);
    expect(O.isNone(decoded.order)).toBe(true);
    expect(O.isNone(decoded.cooldowns)).toBe(true);

    const cooldowns = decodeAuthCooldownsConfig({});

    expect(O.isNone(cooldowns.billingBackoffHours)).toBe(true);
    expect(O.isNone(cooldowns.billingBackoffHoursByProvider)).toBe(true);
    expect(O.isNone(cooldowns.billingMaxHours)).toBe(true);
    expect(O.isNone(cooldowns.failureWindowHours)).toBe(true);
  });

  it("rejects invalid auth profile modes", () => {
    expect(() =>
      decodeAuthProfileConfig({
        provider: "Anthropic",
        mode: "refresh_token",
      })
    ).toThrow();
  });

  it("rejects zero or negative cooldown values, including per-provider overrides", () => {
    expect(() =>
      decodeAuthCooldownsConfig({
        billingBackoffHours: 0,
      })
    ).toThrow();

    expect(() =>
      decodeAuthCooldownsConfig({
        billingMaxHours: -1,
      })
    ).toThrow();

    expect(() =>
      decodeAuthCooldownsConfig({
        billingBackoffHoursByProvider: {
          Anthropic: 0,
        },
      })
    ).toThrow();
  });

  it("rejects excess properties when decoded in strict mode", () => {
    expect(() =>
      decodeAuthConfig(
        {
          profiles: {
            primary: {
              provider: "Anthropic",
              mode: "oauth",
              extra: true,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeAuthCooldownsConfig(
        {
          billingBackoffHours: 5,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeAuthConfig(
        {
          profiles: {
            primary: {
              provider: "Anthropic",
              mode: "oauth",
            },
          },
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
