import type * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import browserChalk, {
  Chalk as BrowserChalk,
  type ChalkInstance as BrowserChalkInstance,
  type Chalk as BrowserChalkType,
  chalkStderr as browserChalkStderr,
} from "../src/Chalk.browser.ts";
import type { ChalkInstance } from "../src/index.ts";
import chalk, {
  type BackgroundColorName,
  type backgroundColorNames,
  Chalk,
  type ChalkConstructorOptions,
  type ChalkConstructorOptions as ChalkConstructorOptionsType,
  type ChalkOptions,
  type ColorInfo,
  type ColorName,
  type ColorSupport,
  type ColorSupportLevel,
  type ColorSupportLevelInput,
  type ColorSupportLevelInput as ColorSupportLevelInputType,
  chalkStderr,
  type colorNames,
  type ForegroundColorName,
  type foregroundColorNames,
  type ModifierName,
  type modifierNames,
  supportsColor,
  supportsColorStderr,
} from "../src/index.ts";

describe("@beep/chalk", () => {
  it("exposes the shared builder and constructor types", () => {
    const broadLevel: number = 3;

    expect(chalk).type.toBe<ChalkInstance>();
    expect(new Chalk()).type.toBe<Chalk>();
    expect(new Chalk({ level: 1 })).type.toBe<Chalk>();
    expect(new Chalk({ level: broadLevel })).type.toBe<Chalk>();
    expect(chalkStderr).type.toBe<ChalkInstance>();
  });

  it("types browser entry parity", () => {
    const broadLevel: number = 3;

    expect(browserChalk).type.toBe<BrowserChalkInstance>();
    expect(new BrowserChalk()).type.toBe<BrowserChalkType>();
    expect(new BrowserChalk({ level: broadLevel })).type.toBe<BrowserChalkType>();
    expect(browserChalkStderr).type.toBe<BrowserChalkInstance>();
  });

  it("keeps schema-backed public models typed", () => {
    expect<ChalkOptions["level"]>().type.toBe<ColorSupportLevel | undefined>();
    expect<ChalkConstructorOptionsType["level"]>().type.toBe<number | undefined>();
    expect<typeof ChalkConstructorOptions.Encoded>().type.toBeAssignableTo<ChalkConstructorOptionsType>();
    expect<ChalkConstructorOptionsType>().type.toBeAssignableTo<typeof ChalkConstructorOptions.Encoded>();
    expect<typeof ColorSupportLevelInput.Type>().type.toBe<ColorSupportLevelInputType>();
    expect<typeof ColorSupportLevelInput>().type.toBeAssignableTo<S.Top>();
    expect<ColorSupportLevel>().type.toBe<0 | 1 | 2 | 3>();
    expect<ColorSupport>().type.toBe<{
      readonly has16m: boolean;
      readonly has256: boolean;
      readonly hasBasic: boolean;
      readonly level: 0 | 1 | 2 | 3;
    }>();
    expect<ColorInfo>().type.toBe<ColorSupport | false>();
  });

  it("types the callable chainable builder surface", () => {
    expect(chalk.level).type.toBe<ColorSupportLevel>();
    expect(chalk.rgb(1, 2, 3)).type.toBe<ChalkInstance>();
    expect(chalk.hex("#FF0000")).type.toBe<ChalkInstance>();
    expect(chalk.ansi256(10)).type.toBe<ChalkInstance>();
    expect(chalk.bgRgb(1, 2, 3)).type.toBe<ChalkInstance>();
    expect(chalk.bgHex("#FF0000")).type.toBe<ChalkInstance>();
    expect(chalk.bgAnsi256(10)).type.toBe<ChalkInstance>();
    expect(chalk.red.bgGreen.bold("hello")).type.toBe<string>();
    expect(chalk.visible.red("hello")).type.toBe<string>();
    expect(chalk.red`hello`).type.toBe<string>();
    expect(chalk.red`hello ${"x"}!`).type.toBe<string>();
  });

  it("types exported compatibility arrays", () => {
    expect<(typeof modifierNames)[number]>().type.toBe<ModifierName>();
    expect<(typeof foregroundColorNames)[number]>().type.toBe<ForegroundColorName>();
    expect<(typeof backgroundColorNames)[number]>().type.toBe<BackgroundColorName>();
    expect<(typeof colorNames)[number]>().type.toBe<ColorName>();
  });

  it("types support metadata exports", () => {
    expect(supportsColor).type.toBe<ColorInfo>();
    expect(supportsColorStderr).type.toBe<ColorInfo>();
  });

  it("rejects invalid public literals", () => {
    // @ts-expect-error!
    const invalidModifier: ModifierName = "delete";
    // @ts-expect-error!
    const invalidForeground: ForegroundColorName = "pink";
    // @ts-expect-error!
    const invalidBackground: BackgroundColorName = "bgPink";
    // @ts-expect-error!
    const invalidColor: ColorName = "hotpink";
    // @ts-expect-error!
    const invalidConstructorOptions: ChalkConstructorOptionsType = { level: "3" };

    void invalidModifier;
    void invalidForeground;
    void invalidBackground;
    void invalidColor;
    void invalidConstructorOptions;
  });
});
