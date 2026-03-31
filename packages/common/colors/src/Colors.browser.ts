/**
 * Browser-safe entrypoint for `@beep/colors`.
 *
 * Browser consoles do not interpret ANSI escape sequences, so this entrypoint always
 * returns plain string formatters while preserving the same API shape as the default module.
 *
 * @since 0.0.0
 * @module @beep/colors/Colors.browser
 */

import { Colors, Formatter, type Formatter as FormatterType } from "./Colors.ts";

const identity: FormatterType = (input) => String(input);

/**
 * Browser builds never emit ANSI escape sequences.
 *
 * @category Detection
 * @since 0.0.0
 */
export const isColorSupported = false;

/**
 * Browser builds always disable ANSI escape sequences.
 *
 * @category Detection
 * @returns {boolean} - Always `false` in browser-safe builds.
 * @since 0.0.0
 */
export const supportsColor = (): boolean => false;

/**
 * Create a browser-safe formatter set that never emits ANSI escape sequences.
 *
 * @category Constructors
 * @returns {Colors} - A formatter set whose members coerce input with `String(...)`.
 * @since 0.0.0
 */
export const createColors = (): Colors =>
  new Colors({
    isColorSupported: false,
    reset: identity,
    bold: identity,
    dim: identity,
    italic: identity,
    underline: identity,
    inverse: identity,
    hidden: identity,
    strikethrough: identity,
    black: identity,
    red: identity,
    green: identity,
    yellow: identity,
    blue: identity,
    magenta: identity,
    cyan: identity,
    white: identity,
    gray: identity,
    bgBlack: identity,
    bgRed: identity,
    bgGreen: identity,
    bgYellow: identity,
    bgBlue: identity,
    bgMagenta: identity,
    bgCyan: identity,
    bgWhite: identity,
    blackBright: identity,
    redBright: identity,
    greenBright: identity,
    yellowBright: identity,
    blueBright: identity,
    magentaBright: identity,
    cyanBright: identity,
    whiteBright: identity,
    bgBlackBright: identity,
    bgRedBright: identity,
    bgGreenBright: identity,
    bgYellowBright: identity,
    bgBlueBright: identity,
    bgMagentaBright: identity,
    bgCyanBright: identity,
    bgWhiteBright: identity,
  });

/**
 * Default browser-safe formatter set.
 *
 * @category Constructors
 * @since 0.0.0
 */
const colors = createColors();

export { Colors, Formatter };
export default colors;
