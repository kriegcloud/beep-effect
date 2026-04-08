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

const getBrowserNavigator = (): Navigator | undefined => ("navigator" in globalThis ? globalThis.navigator : undefined);

const browserColorSupportFromNavigator = (browserNavigator: BrowserNavigator): ColorInfo => {
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

const browserColorSupport = (): ColorInfo => {
  const browserNavigator = getBrowserNavigator();

  if (browserNavigator === undefined) {
    return false;
  }

  return browserColorSupportFromNavigator(browserNavigator);
};

export const detectedSupportsColorBrowser = {
  stderr: browserColorSupport(),
  stdout: browserColorSupport(),
};
