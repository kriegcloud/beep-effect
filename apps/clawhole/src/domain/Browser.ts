/**
 * Browser configuration schemas for `@beep/clawhole`.
 *
 * This module ports the upstream browser config surface into the repository's
 * schema-first conventions. It keeps the scope at config-shape validation:
 * decode-time invariants such as port ranges, profile-key validation, and
 * existing-session profile rules live here, while runtime default resolution
 * stays outside this module.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { BrowserConfig } from "@beep/clawhole/domain/Browser";
 *
 * const browser = S.decodeUnknownSync(BrowserConfig)({
 *   color: "#FF4500",
 *   profiles: {
 *     chrome: {
 *       cdpPort: 9222,
 *       color: "#FF4500"
 *     },
 *     user: {
 *       driver: "existing-session",
 *       userDataDir: "/tmp/chrome-user",
 *       color: "00AA00"
 *     }
 *   }
 * });
 *
 * console.log(browser instanceof BrowserConfig); // true
 * ```
 *
 * @module @beep/clawhole/domain/Browser
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { ArrayOfStrings, HexColor, LiteralKit } from "@beep/schema";
import { identity, SchemaGetter } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $ClawholeId.create("config/Browser");

const browserParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const browserProfileNamePattern = /^[a-z0-9-]+$/;
const browserHexColorInputPattern = /^#?[0-9a-fA-F]{6}$/;

const addBrowserHexColorPrefix = (value: string): string =>
  Bool.match(Str.startsWith("#")(value), {
    onFalse: () => `#${value}`,
    onTrue: () => value,
  });

const normalizeBrowserHexColor = (value: string): string => Str.toLowerCase(addBrowserHexColorPrefix(value));

const BrowserProfileName = S.String.check(
  S.isPattern(browserProfileNamePattern, {
    identifier: $I`BrowserProfileNameCheck`,
    title: "Browser Profile Name",
    description: "A browser profile name using lowercase ASCII letters, digits, and hyphens.",
    message: "Browser profile names must use lowercase ASCII letters, digits, and hyphens only",
  })
).pipe(
  S.brand("BrowserProfileName"),
  $I.annoteSchema("BrowserProfileName", {
    description: "A browser profile name using lowercase ASCII letters, digits, and hyphens.",
  })
);

const BrowserPort = S.Int.check(
  S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(65535)], {
    identifier: $I`BrowserPortChecks`,
    title: "Browser Port",
    description: "A browser port integer between 1 and 65535.",
  })
).pipe(
  $I.annoteSchema("BrowserPort", {
    description: "A browser port integer between 1 and 65535.",
  })
);

const BrowserTimeoutMs = S.Int.check(S.isGreaterThanOrEqualTo(0)).pipe(
  $I.annoteSchema("BrowserTimeoutMs", {
    description: "A non-negative browser timeout in milliseconds.",
  })
);

const BrowserHexColorInput = S.String.check(
  S.isPattern(browserHexColorInputPattern, {
    identifier: $I`BrowserHexColorInputCheck`,
    title: "Browser Hex Color Input",
    description: "A six-digit browser hex color string with an optional leading `#`.",
    message: "Browser colors must be six-digit hex values in RRGGBB form",
  })
).pipe(
  $I.annoteSchema("BrowserHexColorInput", {
    description: "A six-digit browser hex color string with an optional leading `#`.",
  })
);

const BrowserHexColor = BrowserHexColorInput.pipe(
  S.decodeTo(HexColor, {
    decode: SchemaGetter.transform(normalizeBrowserHexColor),
    encode: SchemaGetter.transform(identity),
  }),
  $I.annoteSchema("BrowserHexColor", {
    description: "A canonical lowercase six-digit browser hex color string.",
  })
);

const hasConfiguredCdpUrl = (value: O.Option<string>): boolean =>
  O.match(value, {
    onNone: () => false,
    onSome: Str.isNonEmpty,
  });

const usesExistingSessionDriver = (value: O.Option<BrowserProfileDriver>): boolean =>
  O.match(value, {
    onNone: () => false,
    onSome: BrowserProfileDriver.is["existing-session"],
  });

/**
 * Supported browser profile drivers.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const BrowserProfileDriver = LiteralKit(["openclaw", "clawd", "existing-session"]).pipe(
  $I.annoteSchema("BrowserProfileDriver", {
    description: "Supported browser profile drivers.",
  })
);

/**
 * Type of {@link BrowserProfileDriver}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type BrowserProfileDriver = typeof BrowserProfileDriver.Type;

/**
 * Supported default browser snapshot modes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const BrowserSnapshotMode = LiteralKit(["efficient"]).pipe(
  $I.annoteSchema("BrowserSnapshotMode", {
    description: "Supported default browser snapshot modes.",
  })
);

/**
 * Type of {@link BrowserSnapshotMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type BrowserSnapshotMode = typeof BrowserSnapshotMode.Type;

/**
 * Default browser snapshot settings used when tool input omits per-call values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BrowserSnapshotDefaults extends S.Class<BrowserSnapshotDefaults>($I`BrowserSnapshotDefaults`)(
  {
    mode: S.OptionFromOptionalKey(BrowserSnapshotMode).annotateKey({
      description: "Default snapshot mode applied when a browser snapshot call omits `mode`.",
    }),
  },
  $I.annote("BrowserSnapshotDefaults", {
    description: "Default browser snapshot settings used when tool input omits per-call values.",
    parseOptions: browserParseOptions,
  })
) {}

/**
 * SSRF policy configuration for browser navigation and open-tab operations.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BrowserSsrFPolicyConfig extends S.Class<BrowserSsrFPolicyConfig>($I`BrowserSsrFPolicyConfig`)(
  {
    allowPrivateNetwork: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Legacy alias for private-network access.",
    }),
    dangerouslyAllowPrivateNetwork: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether browser navigation to private or internal networks is permitted.",
    }),
    allowedHostnames: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Exact-match hostnames explicitly allowed for browser navigation.",
    }),
    hostnameAllowlist: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Browser hostname allowlist patterns, including `*.example.com` wildcard subdomains.",
    }),
  },
  $I.annote("BrowserSsrFPolicyConfig", {
    description: "SSRF policy configuration for browser navigation and open-tab operations.",
    parseOptions: browserParseOptions,
  })
) {}

class BrowserProfileConfigData extends S.Class<BrowserProfileConfigData>($I`BrowserProfileConfig`)(
  {
    cdpPort: S.OptionFromOptionalKey(BrowserPort).annotateKey({
      description: "CDP port allocated to the browser profile.",
    }),
    cdpUrl: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "CDP URL used to connect to a browser profile on a remote host.",
    }),
    userDataDir: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Explicit user-data directory for an existing-session browser attachment.",
    }),
    driver: S.OptionFromOptionalKey(BrowserProfileDriver).annotateKey({
      description: "Browser profile driver implementation.",
    }),
    attachOnly: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the profile should only attach to an existing browser session.",
    }),
    color: BrowserHexColor.annotateKey({
      description: "Browser profile accent color.",
    }),
  },
  $I.annote("BrowserProfileConfig", {
    description: "A named browser profile with CDP connection details, driver metadata, and display color.",
    parseOptions: browserParseOptions,
  })
) {}

/**
 * Configuration for one named browser profile.
 *
 * Non-`existing-session` profiles must provide either `cdpPort` or `cdpUrl`.
 * `userDataDir` is only valid when `driver` is `existing-session`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const BrowserProfileConfig = BrowserProfileConfigData.check(
  S.makeFilterGroup(
    [
      S.makeFilter(
        (value) =>
          usesExistingSessionDriver(value.driver) || O.isSome(value.cdpPort) || hasConfiguredCdpUrl(value.cdpUrl),
        {
          identifier: $I`BrowserProfileConfigConnectionCheck`,
          title: "Browser Profile Connection",
          description: "Non-existing-session browser profiles must define a CDP port or CDP URL.",
          message: "Browser profiles must define cdpPort or cdpUrl unless driver is existing-session",
        }
      ),
      S.makeFilter((value) => usesExistingSessionDriver(value.driver) || O.isNone(value.userDataDir), {
        identifier: $I`BrowserProfileConfigUserDataDirCheck`,
        title: "Browser Profile Existing Session User Data Dir",
        description: "Browser profile userDataDir is only supported for existing-session profiles.",
        message: "Browser profile userDataDir is only supported when driver is existing-session",
      }),
    ],
    {
      identifier: $I`BrowserProfileConfigChecks`,
      title: "Browser Profile Config",
      description: "Cross-field validation for browser profile connection and existing-session rules.",
    }
  )
);

/**
 * Type of {@link BrowserProfileConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type BrowserProfileConfig = typeof BrowserProfileConfig.Type;

/**
 * Top-level browser configuration for clawhole.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { BrowserConfig } from "@beep/clawhole/domain/Browser";
 *
 * const browser = S.decodeUnknownSync(BrowserConfig)({
 *   enabled: true,
 *   profiles: {
 *     chrome: {
 *       cdpPort: 9222,
 *       color: "#ff4500"
 *     }
 *   }
 * });
 *
 * console.log(browser.enabled);
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BrowserConfig extends S.Class<BrowserConfig>($I`BrowserConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether browser tooling is enabled.",
    }),
    evaluateEnabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether browser `act:evaluate` execution is enabled.",
    }),
    cdpUrl: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Base CDP endpoint URL used for remote browser connections.",
    }),
    remoteCdpTimeoutMs: S.OptionFromOptionalKey(BrowserTimeoutMs).annotateKey({
      description: "Remote CDP HTTP timeout in milliseconds.",
    }),
    remoteCdpHandshakeTimeoutMs: S.OptionFromOptionalKey(BrowserTimeoutMs).annotateKey({
      description: "Remote CDP WebSocket handshake timeout in milliseconds.",
    }),
    color: S.OptionFromOptionalKey(BrowserHexColor).annotateKey({
      description: "Default browser profile accent color.",
    }),
    executablePath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional executable path override for the browser process.",
    }),
    headless: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the browser should launch headless.",
    }),
    noSandbox: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the browser launch should pass `--no-sandbox`.",
    }),
    attachOnly: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the browser should never launch and only attach to an existing session.",
    }),
    cdpPortRangeStart: S.OptionFromOptionalKey(BrowserPort).annotateKey({
      description: "Starting local CDP port for auto-assigned browser profiles.",
    }),
    defaultProfile: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Default profile name used when browser calls omit an explicit profile.",
    }),
    profiles: S.OptionFromOptionalKey(S.Record(BrowserProfileName, BrowserProfileConfig)).annotateKey({
      description: "Named browser profiles keyed by profile name.",
    }),
    snapshotDefaults: S.OptionFromOptionalKey(BrowserSnapshotDefaults).annotateKey({
      description: "Default browser snapshot options applied when tool input leaves them unset.",
    }),
    ssrfPolicy: S.OptionFromOptionalKey(BrowserSsrFPolicyConfig).annotateKey({
      description: "SSRF policy settings applied to browser navigation and open-tab operations.",
    }),
    extraArgs: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Additional launch arguments forwarded to the browser process.",
    }),
  },
  $I.annote("BrowserConfig", {
    description: "Top-level browser configuration for clawhole.",
    parseOptions: browserParseOptions,
  })
) {}
