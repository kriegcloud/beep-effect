import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  CanvasHostConfig,
  DiscoveryConfig,
  GatewayConfig,
  GatewayHttpChatCompletionsImagesConfig,
  GatewayHttpSecurityHeadersConfig,
  GatewayRemoteConfig,
  GatewayTlsConfig,
  TalkConfig,
  TalkConfigResponse,
  TalkProviderConfig,
} from "../../src/config/Gateway.ts";

const decodeCanvasHostConfig = S.decodeUnknownSync(CanvasHostConfig);
const decodeDiscoveryConfig = S.decodeUnknownSync(DiscoveryConfig);
const decodeGatewayConfig = S.decodeUnknownSync(GatewayConfig);
const decodeGatewayHttpChatCompletionsImagesConfig = S.decodeUnknownSync(GatewayHttpChatCompletionsImagesConfig);
const decodeGatewayHttpSecurityHeadersConfig = S.decodeUnknownSync(GatewayHttpSecurityHeadersConfig);
const decodeGatewayRemoteConfig = S.decodeUnknownSync(GatewayRemoteConfig);
const decodeGatewayTlsConfig = S.decodeUnknownSync(GatewayTlsConfig);
const decodeTalkConfig = S.decodeUnknownSync(TalkConfig);
const decodeTalkConfigResponse = S.decodeUnknownSync(TalkConfigResponse);
const decodeTalkProviderConfig = S.decodeUnknownSync(TalkProviderConfig);

describe("Gateway schemas", () => {
  it("decodes minimal TLS config and keeps the schema default for autoGenerate", () => {
    const decoded = decodeGatewayTlsConfig({});

    expect(O.getOrUndefined(decoded.enabled)).toBeUndefined();
    expect(decoded.autoGenerate).toBe(true);
    expect(O.getOrUndefined(decoded.certPath)).toBeUndefined();
  });

  it("decodes explicit TLS file paths", () => {
    const decoded = decodeGatewayTlsConfig({
      enabled: true,
      autoGenerate: false,
      certPath: "/tmp/cert.pem",
      keyPath: "/tmp/key.pem",
      caPath: "/tmp/ca.pem",
    });

    expect(O.getOrUndefined(decoded.enabled)).toBe(true);
    expect(decoded.autoGenerate).toBe(false);
    expect(O.getOrUndefined(decoded.certPath)).toBe("/tmp/cert.pem");
    expect(O.getOrUndefined(decoded.keyPath)).toBe("/tmp/key.pem");
    expect(O.getOrUndefined(decoded.caPath)).toBe("/tmp/ca.pem");
  });

  it("decodes discovery and canvas config payloads", () => {
    const discovery = decodeDiscoveryConfig({
      wideArea: {
        enabled: true,
        domain: "openclaw.internal",
      },
      mdns: {
        mode: "minimal",
      },
    });
    const canvas = decodeCanvasHostConfig({
      enabled: true,
      root: "/tmp/workspace/canvas",
      port: 18_793,
      liveReload: true,
    });

    expect(O.getOrUndefined(O.getOrThrow(discovery.wideArea).enabled)).toBe(true);
    expect(O.getOrUndefined(O.getOrThrow(discovery.wideArea).domain)).toBe("openclaw.internal");
    expect(O.getOrUndefined(O.getOrThrow(discovery.mdns).mode)).toBe("minimal");
    expect(O.getOrUndefined(canvas.root)).toBe("/tmp/workspace/canvas");
    expect(O.getOrUndefined(canvas.port)).toBe(18_793);
  });

  it("allows provider-specific extension keys in Talk provider config", () => {
    const decoded = decodeTalkProviderConfig({
      voiceId: "nova",
      apiKey: {
        source: "env",
        provider: "default",
        id: "OPENAI_API_KEY",
      },
      latency: "low",
      retries: 3,
    });

    expect(decoded.voiceId).toBe("nova");
    expect(decoded).toMatchObject({
      latency: "low",
      retries: 3,
    });
  });

  it("decodes talk config responses with resolved provider payloads", () => {
    const decoded = decodeTalkConfigResponse({
      provider: "elevenlabs",
      providers: {
        elevenlabs: {
          region: "us-east-1",
        },
      },
      interruptOnSpeech: true,
      resolved: {
        provider: "elevenlabs",
        config: {
          region: "us-east-1",
        },
      },
    });

    expect(O.getOrUndefined(decoded.provider)).toBe("elevenlabs");
    expect(O.getOrUndefined(decoded.interruptOnSpeech)).toBe(true);
    expect(O.getOrThrow(decoded.resolved).provider).toBe("elevenlabs");
    expect(O.getOrThrow(decoded.resolved)).toMatchObject({
      provider: "elevenlabs",
      config: {
        region: "us-east-1",
      },
    });
  });

  it("decodes top-level gateway config with nested auth, remote, and HTTP payloads", () => {
    const decoded = decodeGatewayConfig({
      port: 18_789,
      mode: "remote",
      bind: "loopback",
      controlUi: {
        root: "/tmp/control-ui",
        allowedOrigins: ["https://control.example.com"],
      },
      auth: {
        mode: "token",
        token: {
          source: "env",
          provider: "default",
          id: "OPENAI_API_KEY",
        },
        rateLimit: {
          maxAttempts: 10,
          windowMs: 60_000,
          lockoutMs: 300_000,
          exemptLoopback: true,
        },
      },
      remote: {
        enabled: false,
        url: "wss://remote.example.com:18789",
        transport: "ssh",
        password: {
          source: "env",
          provider: "default",
          id: "GATEWAY_PASSWORD",
        },
        sshTarget: "ops@remote.example.com",
        sshIdentity: "/tmp/id_ed25519",
      },
      http: {
        endpoints: {
          responses: {
            enabled: true,
            maxUrlParts: 0,
            files: {
              allowUrl: true,
              maxBytes: 5_000,
              maxChars: 200_000,
              maxRedirects: 3,
              timeoutMs: 10_000,
              pdf: {
                maxPages: 4,
                maxPixels: 4_000_000,
                minTextChars: 0,
              },
            },
          },
        },
      },
      channelHealthCheckMinutes: 0,
      channelStaleEventThresholdMinutes: 1,
    });

    expect(O.getOrUndefined(decoded.mode)).toBe("remote");
    expect(O.getOrUndefined(O.getOrThrow(decoded.controlUi).root)).toBe("/tmp/control-ui");
    expect(O.getOrUndefined(O.getOrThrow(decoded.remote).enabled)).toBe(false);
    expect(O.getOrUndefined(O.getOrThrow(decoded.remote).transport)).toBe("ssh");
    expect(O.getOrUndefined(O.getOrThrow(O.getOrThrow(decoded.http).endpoints).responses)).toBeDefined();
  });

  it("accepts HSTS as either a string or false", () => {
    const enabled = decodeGatewayHttpSecurityHeadersConfig({
      strictTransportSecurity: "max-age=31536000; includeSubDomains",
    });
    const disabled = decodeGatewayHttpSecurityHeadersConfig({
      strictTransportSecurity: false,
    });

    expect(O.getOrUndefined(enabled.strictTransportSecurity)).toBe("max-age=31536000; includeSubDomains");
    expect(O.getOrUndefined(disabled.strictTransportSecurity)).toBe(false);
  });

  it("decodes remote config enabled even though upstream zod currently drifts", () => {
    const decoded = decodeGatewayRemoteConfig({
      enabled: true,
      url: "wss://remote.example.com/ws",
    });

    expect(O.getOrUndefined(decoded.enabled)).toBe(true);
    expect(O.getOrUndefined(decoded.url)).toBe("wss://remote.example.com/ws");
  });

  it("rejects invalid positive and non-negative integer fields", () => {
    expect(() =>
      decodeGatewayHttpChatCompletionsImagesConfig({
        maxBytes: 0,
      })
    ).toThrow();

    expect(() =>
      decodeGatewayHttpChatCompletionsImagesConfig({
        maxRedirects: -1,
      })
    ).toThrow();
  });

  it("rejects invalid TLS file paths", () => {
    expect(() =>
      decodeGatewayTlsConfig({
        certPath: "certs/",
      })
    ).toThrow();
  });

  it("rejects invalid HSTS values", () => {
    expect(() =>
      decodeGatewayHttpSecurityHeadersConfig({
        strictTransportSecurity: 1,
      })
    ).toThrow();
  });

  it("rejects talk config when provider does not match a configured provider key", () => {
    expect(() =>
      decodeTalkConfig({
        provider: "azure",
        providers: {
          openai: {
            voiceId: "nova",
          },
        },
      })
    ).toThrow();
  });

  it("rejects talk config when multiple providers are configured without an active provider", () => {
    expect(() =>
      decodeTalkConfig({
        providers: {
          elevenlabs: {
            voiceId: "nova",
          },
          openai: {
            voiceId: "alloy",
          },
        },
      })
    ).toThrow();
  });

  it("rejects gateway config when stale threshold is lower than the active health-check interval", () => {
    expect(() =>
      decodeGatewayConfig({
        channelHealthCheckMinutes: 5,
        channelStaleEventThresholdMinutes: 4,
      })
    ).toThrow();
  });
});
