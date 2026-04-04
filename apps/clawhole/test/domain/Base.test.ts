import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  AgentElevatedAllowFromConfig,
  BlockStreamingChunkConfig,
  BlockStreamingCoalesceConfig,
  DiagnosticsConfig,
  DiagnosticsOtelConfig,
  HumanDelayConfig,
  IdentityConfig,
  LoggingConfig,
  MarkdownConfig,
  OutboundRetryConfig,
  ReplyMode,
  SessionAgentToAgentConfig,
  SessionConfig,
  SessionMaintenanceConfig,
  SessionMaintenanceMode,
  SessionResetConfig,
  SessionResetMode,
  SessionSendPolicyAction,
  SessionSendPolicyConfig,
  TypingMode,
  WebConfig,
  WebReconnectConfig,
} from "../../src/domain/Base.ts";

const decodeReplyMode = S.decodeUnknownSync(ReplyMode);
const decodeTypingMode = S.decodeUnknownSync(TypingMode);
const decodeSessionSendPolicyAction = S.decodeUnknownSync(SessionSendPolicyAction);
const decodeSessionResetMode = S.decodeUnknownSync(SessionResetMode);
const decodeSessionMaintenanceMode = S.decodeUnknownSync(SessionMaintenanceMode);
const decodeMarkdownConfig = S.decodeUnknownSync(MarkdownConfig);
const decodeHumanDelayConfig = S.decodeUnknownSync(HumanDelayConfig);
const decodeSessionSendPolicyConfig = S.decodeUnknownSync(SessionSendPolicyConfig);
const decodeSessionResetConfig = S.decodeUnknownSync(SessionResetConfig);
const decodeSessionAgentToAgentConfig = S.decodeUnknownSync(SessionAgentToAgentConfig);
const decodeSessionMaintenanceConfig = S.decodeUnknownSync(SessionMaintenanceConfig);
const decodeSessionConfig = S.decodeUnknownSync(SessionConfig);
const decodeLoggingConfig = S.decodeUnknownSync(LoggingConfig);
const decodeDiagnosticsOtelConfig = S.decodeUnknownSync(DiagnosticsOtelConfig);
const decodeDiagnosticsConfig = S.decodeUnknownSync(DiagnosticsConfig);
const decodeWebReconnectConfig = S.decodeUnknownSync(WebReconnectConfig);
const decodeWebConfig = S.decodeUnknownSync(WebConfig);
const decodeIdentityConfig = S.decodeUnknownSync(IdentityConfig);
const decodeOutboundRetryConfig = S.decodeUnknownSync(OutboundRetryConfig);
const decodeBlockStreamingCoalesceConfig = S.decodeUnknownSync(BlockStreamingCoalesceConfig);
const decodeBlockStreamingChunkConfig = S.decodeUnknownSync(BlockStreamingChunkConfig);
const decodeAgentElevatedAllowFromConfig = S.decodeUnknownSync(AgentElevatedAllowFromConfig);

describe("Base config schemas", () => {
  it("decodes canonical literal domains and rejects unsupported values", () => {
    expect(decodeReplyMode("text")).toBe("text");
    expect(decodeTypingMode("message")).toBe("message");
    expect(decodeSessionSendPolicyAction("allow")).toBe("allow");
    expect(decodeSessionResetMode("daily")).toBe("daily");
    expect(decodeSessionMaintenanceMode("warn")).toBe("warn");

    expect(() => decodeReplyMode("slash")).toThrow();
    expect(() => decodeTypingMode("typing")).toThrow();
    expect(() => decodeSessionSendPolicyAction("block")).toThrow();
    expect(() => decodeSessionResetMode("weekly")).toThrow();
    expect(() => decodeSessionMaintenanceMode("report")).toThrow();
  });

  it("decodes markdown and human-delay config objects", () => {
    const markdown = decodeMarkdownConfig({
      tables: "code",
    });
    const humanDelay = decodeHumanDelayConfig({
      mode: "custom",
      minMs: 0,
      maxMs: 2500,
    });

    expect(markdown).toBeInstanceOf(MarkdownConfig);
    expect(markdown.tables).toEqual(O.some("code"));

    expect(humanDelay).toBeInstanceOf(HumanDelayConfig);
    expect(humanDelay.mode).toEqual(O.some("custom"));
    expect(humanDelay.minMs).toEqual(O.some(0));
    expect(humanDelay.maxMs).toEqual(O.some(2500));

    expect(() =>
      decodeMarkdownConfig({
        tables: "plain",
      })
    ).toThrow();
  });

  it("decodes session send-policy config and preserves the deprecated dm alias", () => {
    const config = decodeSessionSendPolicyConfig({
      default: "deny",
      rules: [
        {
          action: "allow",
          match: {
            channel: "discord",
            chatType: "dm",
            keyPrefix: "agent:ops:",
            rawKeyPrefix: "agent:ops:discord:",
          },
        },
      ],
    });

    expect(config).toBeInstanceOf(SessionSendPolicyConfig);
    expect(config.default).toEqual(O.some("deny"));
    expect(O.isSome(config.rules)).toBe(true);

    if (O.isSome(config.rules)) {
      const rule = config.rules.value[0];
      expect(rule?.action).toBe("allow");
      expect(O.isSome(rule?.match)).toBe(true);

      if (rule && O.isSome(rule.match)) {
        expect(rule.match.value.chatType).toEqual(O.some("dm"));
        expect(rule.match.value.channel).toEqual(O.some("discord"));
      }
    }
  });

  it("accepts session reset hour boundaries and rejects invalid hour values", () => {
    expect(decodeSessionResetConfig({ atHour: 0 }).atHour).toEqual(O.some(0));
    expect(decodeSessionResetConfig({ atHour: 23 }).atHour).toEqual(O.some(23));

    expect(() =>
      decodeSessionResetConfig({
        atHour: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSessionResetConfig({
        atHour: 24,
      })
    ).toThrow();
  });

  it("accepts agent-to-agent ping-pong bounds and rejects out-of-range values", () => {
    expect(decodeSessionAgentToAgentConfig({ maxPingPongTurns: 0 }).maxPingPongTurns).toEqual(O.some(0));
    expect(decodeSessionAgentToAgentConfig({ maxPingPongTurns: 5 }).maxPingPongTurns).toEqual(O.some(5));

    expect(() =>
      decodeSessionAgentToAgentConfig({
        maxPingPongTurns: -1,
      })
    ).toThrow();

    expect(() =>
      decodeSessionAgentToAgentConfig({
        maxPingPongTurns: 6,
      })
    ).toThrow();
  });

  it("accepts validated session-maintenance extension inputs and rejects invalid strings", () => {
    const config = decodeSessionMaintenanceConfig({
      mode: "warn",
      pruneAfter: "14d",
      rotateBytes: "10mb",
      resetArchiveRetention: false,
      maxDiskBytes: "500mb",
      highWaterBytes: "350mb",
    });

    expect(config).toBeInstanceOf(SessionMaintenanceConfig);
    expect(config.pruneAfter).toEqual(O.some("14d"));
    expect(config.rotateBytes).toEqual(O.some("10mb"));
    expect(config.resetArchiveRetention).toEqual(O.some(false));
    expect(config.maxDiskBytes).toEqual(O.some("500mb"));
    expect(config.highWaterBytes).toEqual(O.some("350mb"));

    expect(() =>
      decodeSessionMaintenanceConfig({
        resetArchiveRetention: "never",
      })
    ).toThrow();

    expect(() =>
      decodeSessionMaintenanceConfig({
        maxDiskBytes: "big",
      })
    ).toThrow();
  });

  it("decodes the top-level session config with nested objects and records", () => {
    const config = decodeSessionConfig({
      scope: "per-sender",
      dmScope: "per-account-channel-peer",
      identityLinks: {
        main: ["telegram:123", "discord:456"],
      },
      resetTriggers: ["reset", "clear context"],
      idleMinutes: 15,
      reset: {
        mode: "daily",
        atHour: 4,
      },
      resetByType: {
        direct: {
          mode: "idle",
          idleMinutes: 30,
        },
      },
      resetByChannel: {
        discord: {
          mode: "idle",
          idleMinutes: 60,
        },
      },
      store: "/tmp/sessions.json",
      typingIntervalSeconds: 5,
      typingMode: "message",
      parentForkMaxTokens: 0,
      mainKey: "agent:main",
      sendPolicy: {
        default: "allow",
      },
      agentToAgent: {
        maxPingPongTurns: 2,
      },
      threadBindings: {
        enabled: true,
        idleHours: 24,
        maxAgeHours: 0,
      },
      maintenance: {
        mode: "enforce",
        pruneAfter: "30d",
      },
    });

    expect(config).toBeInstanceOf(SessionConfig);
    expect(config.scope).toEqual(O.some("per-sender"));
    expect(config.dmScope).toEqual(O.some("per-account-channel-peer"));
    expect(config.identityLinks).toEqual(
      O.some({
        main: ["telegram:123", "discord:456"],
      })
    );
    expect(config.typingMode).toEqual(O.some("message"));
    expect(config.parentForkMaxTokens).toEqual(O.some(0));
    expect(O.isSome(config.resetByChannel)).toBe(true);
    expect(O.isSome(config.threadBindings)).toBe(true);
    expect(O.isSome(config.maintenance)).toBe(true);
  });

  it("decodes logging config and rejects invalid logging levels", () => {
    const config = decodeLoggingConfig({
      level: "info",
      file: "/tmp/clawhole.log",
      maxFileBytes: 1024,
      consoleLevel: "warn",
      consoleStyle: "json",
      redactSensitive: "tools",
      redactPatterns: ["token=.*"],
    });

    expect(config).toBeInstanceOf(LoggingConfig);
    expect(config.level).toEqual(O.some("info"));
    expect(config.consoleStyle).toEqual(O.some("json"));
    expect(config.redactSensitive).toEqual(O.some("tools"));

    expect(() =>
      decodeLoggingConfig({
        level: "verbose",
      })
    ).toThrow();
  });

  it("accepts diagnostics OTEL boundaries and rejects invalid sample rates and flush intervals", () => {
    expect(decodeDiagnosticsOtelConfig({ sampleRate: 0 }).sampleRate).toEqual(O.some(0));
    expect(decodeDiagnosticsOtelConfig({ sampleRate: 1 }).sampleRate).toEqual(O.some(1));
    expect(decodeDiagnosticsOtelConfig({ flushIntervalMs: 0 }).flushIntervalMs).toEqual(O.some(0));

    expect(() =>
      decodeDiagnosticsOtelConfig({
        sampleRate: -0.1,
      })
    ).toThrow();

    expect(() =>
      decodeDiagnosticsOtelConfig({
        sampleRate: 1.1,
      })
    ).toThrow();

    expect(() =>
      decodeDiagnosticsOtelConfig({
        flushIntervalMs: -1,
      })
    ).toThrow();
  });

  it("decodes top-level diagnostics config with nested otel and cacheTrace objects", () => {
    const config = decodeDiagnosticsConfig({
      enabled: true,
      flags: ["telegram.http"],
      stuckSessionWarnMs: 1500,
      otel: {
        enabled: true,
        endpoint: "http://localhost:4318",
        protocol: "http/protobuf",
        headers: {
          Authorization: "Bearer token",
        },
        serviceName: "clawhole",
        traces: true,
        metrics: true,
        logs: false,
        sampleRate: 0.5,
        flushIntervalMs: 5000,
      },
      cacheTrace: {
        enabled: true,
        filePath: "/tmp/cache-trace.jsonl",
        includeMessages: true,
        includePrompt: false,
        includeSystem: true,
      },
    });

    expect(config).toBeInstanceOf(DiagnosticsConfig);
    expect(config.flags).toEqual(O.some(["telegram.http"]));
    expect(config.stuckSessionWarnMs).toEqual(O.some(1500));
    expect(O.isSome(config.otel)).toBe(true);
    expect(O.isSome(config.cacheTrace)).toBe(true);
  });

  it("accepts web reconnect jitter boundaries and rejects out-of-range values", () => {
    expect(decodeWebReconnectConfig({ jitter: 0 }).jitter).toEqual(O.some(0));
    expect(decodeWebReconnectConfig({ jitter: 1 }).jitter).toEqual(O.some(1));
    expect(decodeWebReconnectConfig({ maxAttempts: 0 }).maxAttempts).toEqual(O.some(0));

    expect(() =>
      decodeWebReconnectConfig({
        jitter: -0.1,
      })
    ).toThrow();

    expect(() =>
      decodeWebReconnectConfig({
        jitter: 1.1,
      })
    ).toThrow();
  });

  it("decodes top-level web config with nested reconnect policy", () => {
    const config = decodeWebConfig({
      enabled: true,
      heartbeatSeconds: 30,
      reconnect: {
        initialMs: 250,
        maxMs: 5000,
        factor: 2,
        jitter: 0.25,
        maxAttempts: 3,
      },
    });

    expect(config).toBeInstanceOf(WebConfig);
    expect(config.enabled).toEqual(O.some(true));
    expect(config.heartbeatSeconds).toEqual(O.some(30));
    expect(O.isSome(config.reconnect)).toBe(true);
  });

  it("decodes identity config metadata fields", () => {
    const config = decodeIdentityConfig({
      name: "Ops Bot",
      theme: "sunrise",
      emoji: ":robot:",
      avatar: "https://example.com/avatar.png",
    });

    expect(config).toBeInstanceOf(IdentityConfig);
    expect(config.name).toEqual(O.some("Ops Bot"));
    expect(config.theme).toEqual(O.some("sunrise"));
    expect(config.emoji).toEqual(O.some(":robot:"));
    expect(config.avatar).toEqual(O.some("https://example.com/avatar.png"));
  });

  it("accepts outbound retry jitter boundaries and rejects out-of-range values", () => {
    const low = decodeOutboundRetryConfig({ jitter: 0 });
    const high = decodeOutboundRetryConfig({ jitter: 1 });

    expect(low.jitter).toBe(0);
    expect(high.jitter).toBe(1);

    expect(() =>
      decodeOutboundRetryConfig({
        jitter: -0.1,
      })
    ).toThrow();

    expect(() =>
      decodeOutboundRetryConfig({
        jitter: 1.1,
      })
    ).toThrow();
  });

  it("rejects zero character thresholds for block streaming configs after upstream alignment", () => {
    expect(() =>
      decodeBlockStreamingCoalesceConfig({
        minChars: 0,
      })
    ).toThrow();

    expect(() =>
      decodeBlockStreamingChunkConfig({
        maxChars: 0,
      })
    ).toThrow();
  });

  it("decodes elevated allowlists as record values rather than optional entries", () => {
    expect(
      decodeAgentElevatedAllowFromConfig({
        whatsapp: ["+15551234567", 123456],
        telegram: [999],
      })
    ).toEqual({
      whatsapp: ["+15551234567", 123456],
      telegram: [999],
    });
  });
});
