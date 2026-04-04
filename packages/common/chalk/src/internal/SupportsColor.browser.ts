import { type ColorInfo, ColorSupport } from "./ChalkSchema.ts";

type BrowserNavigator = Navigator & {
  readonly userAgentData?: {
    readonly brands: ReadonlyArray<{
      readonly brand: string;
      readonly version: string;
    }>;
  };
};

const hasUserAgentData = (browserNavigator: Navigator): browserNavigator is BrowserNavigator =>
  "userAgentData" in browserNavigator;

const browserColorSupport = (): ColorInfo => {
  if (!("navigator" in globalThis)) {
    return false;
  }

  const browserNavigator = globalThis.navigator;
  const chromium = hasUserAgentData(browserNavigator)
    ? browserNavigator.userAgentData?.brands.find(({ brand }) => brand === "Chromium")
    : undefined;

  if (chromium !== undefined && Number.parseInt(chromium.version, 10) > 93) {
    return new ColorSupport({
      has16m: true,
      has256: true,
      hasBasic: true,
      level: 3,
    });
  }

  if (/\b(Chrome|Chromium)\//.test(browserNavigator.userAgent)) {
    return new ColorSupport({
      has16m: false,
      has256: false,
      hasBasic: true,
      level: 1,
    });
  }

  return false;
};

export const detectedSupportsColorBrowser = {
  stderr: browserColorSupport(),
  stdout: browserColorSupport(),
};
