import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  BrowserConfig,
  BrowserProfileConfig,
  BrowserSnapshotDefaults,
  BrowserSsrFPolicyConfig,
} from "../../src/config/Browser.ts";

const decodeBrowserConfig = S.decodeUnknownSync(BrowserConfig);
const decodeBrowserProfileConfig = S.decodeUnknownSync(BrowserProfileConfig);
const strictParseOptions = { onExcessProperty: "error" } as const;

describe("Browser schemas", () => {
  it("decodes a minimal top-level browser config", () => {
    const config = decodeBrowserConfig({});

    expect(config).toBeInstanceOf(BrowserConfig);
    expect(config.enabled).toEqual(O.none());
    expect(config.profiles).toEqual(O.none());
  });

  it("decodes browser config with profiles, snapshot defaults, SSRF policy, and extra args", () => {
    const config = decodeBrowserConfig({
      enabled: true,
      evaluateEnabled: false,
      color: "#FF4500",
      cdpPortRangeStart: 19000,
      remoteCdpTimeoutMs: 1500,
      remoteCdpHandshakeTimeoutMs: 3000,
      snapshotDefaults: {
        mode: "efficient",
      },
      ssrfPolicy: {
        allowPrivateNetwork: true,
        allowedHostnames: ["localhost"],
        hostnameAllowlist: ["*.example.com"],
      },
      extraArgs: ["--window-size=1920,1080"],
      profiles: {
        chrome: {
          cdpPort: 9222,
          color: "#ABCDEF",
        },
        user: {
          driver: "existing-session",
          userDataDir: "/tmp/chrome-user",
          color: "00AA00",
        },
      },
    });

    expect(config).toBeInstanceOf(BrowserConfig);
    expect(config.color).toEqual(O.some("#ff4500"));
    expect(config.extraArgs).toEqual(O.some(["--window-size=1920,1080"]));

    expect(O.isSome(config.snapshotDefaults)).toBe(true);
    if (O.isSome(config.snapshotDefaults)) {
      expect(config.snapshotDefaults.value).toBeInstanceOf(BrowserSnapshotDefaults);
      expect(config.snapshotDefaults.value.mode).toEqual(O.some("efficient"));
    }

    expect(O.isSome(config.ssrfPolicy)).toBe(true);
    if (O.isSome(config.ssrfPolicy)) {
      expect(config.ssrfPolicy.value).toBeInstanceOf(BrowserSsrFPolicyConfig);
      expect(config.ssrfPolicy.value.allowPrivateNetwork).toEqual(O.some(true));
      expect(config.ssrfPolicy.value.allowedHostnames).toEqual(O.some(["localhost"]));
      expect(config.ssrfPolicy.value.hostnameAllowlist).toEqual(O.some(["*.example.com"]));
    }

    expect(O.isSome(config.profiles)).toBe(true);
    if (O.isSome(config.profiles)) {
      expect(config.profiles.value).toMatchObject({
        chrome: {
          cdpPort: O.some(9222),
          color: "#abcdef",
        },
        user: {
          color: "#00aa00",
        },
      });
    }
  });

  it("decodes existing-session profiles without CDP details", () => {
    const profile = decodeBrowserProfileConfig({
      driver: "existing-session",
      userDataDir: "/tmp/chrome-user",
      color: "#00AA00",
    });

    expect(profile.driver).toEqual(O.some("existing-session"));
    expect(profile.userDataDir).toEqual(O.some("/tmp/chrome-user"));
    expect(profile.color).toBe("#00aa00");
  });

  it("rejects invalid profile keys", () => {
    expect(() =>
      decodeBrowserConfig({
        profiles: {
          "Chrome!!": {
            cdpPort: 9222,
            color: "#ff4500",
          },
        },
      })
    ).toThrow();
  });

  it("rejects invalid port values", () => {
    expect(() =>
      decodeBrowserProfileConfig({
        cdpPort: 0,
        color: "#ff4500",
      })
    ).toThrow();

    expect(() =>
      decodeBrowserConfig({
        cdpPortRangeStart: 65536,
      })
    ).toThrow();
  });

  it("rejects non-existing-session profiles without CDP details", () => {
    expect(() =>
      decodeBrowserProfileConfig({
        color: "#ff4500",
      })
    ).toThrow();
  });

  it("rejects userDataDir on non-existing-session profiles", () => {
    expect(() =>
      decodeBrowserProfileConfig({
        driver: "openclaw",
        cdpPort: 9222,
        userDataDir: "/tmp/chrome-user",
        color: "#ff4500",
      })
    ).toThrow();
  });

  it("rejects excess properties", () => {
    expect(() =>
      decodeBrowserConfig(
        {
          enabled: true,
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeBrowserProfileConfig(
        {
          cdpPort: 9222,
          color: "#ff4500",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
