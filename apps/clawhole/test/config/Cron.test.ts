import { describe, expect, it } from "@effect/vitest";
import { Duration } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { CronConfig } from "../../src/domain/Cron.ts";

const strictParseOptions = { onExcessProperty: "error" } as const;
const decodeCronConfig = S.decodeUnknownSync(CronConfig);

describe("CronConfig", () => {
  it("decodes stable scheduler defaults", () => {
    const config = decodeCronConfig({}, strictParseOptions);

    expect(config.sessionRetention).not.toBe(false);
    if (config.sessionRetention !== false) {
      expect(Duration.toMillis(config.sessionRetention)).toBe(86_400_000);
    }
    expect(config.retry.maxAttempts).toBe(3);
    expect(A.map(config.retry.backoffMs, Duration.toMillis)).toEqual([30_000, 60_000, 300_000]);
    expect(config.retry.retryOn).toEqual(["rate_limit", "overloaded", "network", "timeout", "server_error"]);
    expect(config.runLog.maxBytes).toBe(2_000_000);
    expect(config.runLog.keepLines).toBe(2_000);
    expect(O.isNone(config.webhook)).toBe(true);
    expect(O.isNone(config.failureAlert)).toBe(true);
    expect(O.isNone(config.failureDestination)).toBe(true);
  });

  it("decodes explicit OpenClaw-style cron inputs", () => {
    const config = decodeCronConfig(
      {
        store: "/tmp/cron/jobs.json",
        webhook: "https://example.invalid/cron",
        webhookToken: "secret-token",
        sessionRetention: "1h30m",
        retry: {
          maxAttempts: 5,
          backoffMs: [1_000, 2_000],
          retryOn: ["timeout"],
        },
        runLog: {
          maxBytes: "5mb",
          keepLines: 2500,
        },
        failureAlert: {
          enabled: true,
          after: 2,
          cooldownMs: 60_000,
          mode: "webhook",
          accountId: "bot-a",
        },
        failureDestination: {
          channel: "signal",
          to: "ops-room",
          accountId: "bot-a",
          mode: "announce",
        },
      },
      strictParseOptions
    );

    expect(config.sessionRetention).not.toBe(false);
    if (config.sessionRetention !== false) {
      expect(Duration.toMillis(config.sessionRetention)).toBe(5_400_000);
    }
    expect(A.map(config.retry.backoffMs, Duration.toMillis)).toEqual([1_000, 2_000]);
    expect(config.retry.retryOn).toEqual(["timeout"]);
    expect(config.runLog.maxBytes).toBe("5mb");
    expect(config.runLog.keepLines).toBe(2500);
    expect(O.isSome(config.webhook)).toBe(true);
    if (O.isSome(config.webhook)) {
      expect(config.webhook.value).toBe("https://example.invalid/cron");
    }
    expect(O.isSome(config.webhookToken)).toBe(true);

    expect(O.isSome(config.failureAlert)).toBe(true);
    if (O.isSome(config.failureAlert)) {
      expect(O.getOrUndefined(config.failureAlert.value.enabled)).toBe(true);
      expect(O.getOrUndefined(config.failureAlert.value.after)).toBe(2);
      expect(O.getOrUndefined(config.failureAlert.value.mode)).toBe("webhook");
      expect(O.getOrUndefined(config.failureAlert.value.accountId)).toBe("bot-a");
      expect(O.isSome(config.failureAlert.value.cooldownMs)).toBe(true);
      if (O.isSome(config.failureAlert.value.cooldownMs)) {
        expect(Duration.toMillis(config.failureAlert.value.cooldownMs.value)).toBe(60_000);
      }
    }

    expect(O.isSome(config.failureDestination)).toBe(true);
    if (O.isSome(config.failureDestination)) {
      expect(O.getOrUndefined(config.failureDestination.value.channel)).toBe("signal");
      expect(O.getOrUndefined(config.failureDestination.value.to)).toBe("ops-room");
      expect(O.getOrUndefined(config.failureDestination.value.accountId)).toBe("bot-a");
      expect(O.getOrUndefined(config.failureDestination.value.mode)).toBe("announce");
    }
  });

  it("rejects invalid duration and byte-size inputs", () => {
    expect(() =>
      decodeCronConfig(
        {
          sessionRetention: "abc",
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeCronConfig(
        {
          runLog: {
            maxBytes: "wat",
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });

  it("rejects invalid retry and top-level failureAlert fields", () => {
    expect(() =>
      decodeCronConfig(
        {
          retry: {
            maxAttempts: 11,
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeCronConfig(
        {
          webhook: "ftp://example.invalid/cron",
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeCronConfig(
        {
          failureAlert: {
            enabled: true,
            channel: "telegram",
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
