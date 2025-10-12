/**
 * Converts a hex color to RGB channels.
 *
 * @param {string} hexColor - The hex color string.
 * @returns {string} - The RGB channels string.
 * @throws {Error} - Throws an error if the hex color is invalid.
 *
 * @example
 * const rgbChannel = hexToRgbChannel("#C8FAD6");
 * console.log(rgbChannel); // "200 250 214"
 */
export function hexToRgbChannel(hexColor: string): string {
  if (!hexColor) {
    throw new Error("Hex color is undefined!");
  }

  if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
    throw new Error(`Invalid hex color: ${hexColor}`);
  }

  const r = Number.parseInt(hexColor.substring(1, 3), 16);
  const g = Number.parseInt(hexColor.substring(3, 5), 16);
  const b = Number.parseInt(hexColor.substring(5, 7), 16);

  return `${r} ${g} ${b}`;
}

/**
 * Converts a hex palette color to RGB channels palette.
 *
 * @typedef {Object} InputPalette - The input palette object with hex color strings.
 * @property {string} lighter - The lighter hex color.
 * @property {string} light - The light hex color.
 * @property {string} main - The main hex color.
 *
 * @typedef {Object} ChannelPalette - The output palette object with RGB channels.
 * @property {string} lighterChannel - The lighter RGB channels.
 * @property {string} lightChannel - The light RGB channels.
 * @property {string} mainChannel - The main RGB channels.
 *
 * @param {InputPalette} hexPalette - The input palette object.
 * @returns {ChannelPalette} - The output palette object with RGB channels.
 *
 * @example
 * const palette = createPaletteChannel({
 *   lighter: "#C8FAD6",
 *   light: "#5BE49B",
 *   main: "#00A76F",
 * });
 * console.log(palette);
 * // {
 * //   lighter: "#C8FAD6",
 * //   light: "#5BE49B",
 * //   main: "#00A76F",
 * //   lighterChannel: "200 250 214",
 * //   lightChannel: "91 228 155",
 * //   mainChannel: "0 167 111",
 * // }
 */
export type ColorPalette = Record<string, string | undefined>;

export type ChannelPalette<T extends ColorPalette> = T & {
  [K in keyof T as `${string & K}Channel`]: string;
} & {
  [K in keyof T as K extends number ? `${K}Channel` : never]: string;
};

export function createPaletteChannel<T extends ColorPalette>(hexPalette: T): ChannelPalette<T> {
  const channelPalette: Record<string, string | undefined> = {};

  Object.entries(hexPalette).forEach(([key, value]) => {
    if (value) {
      channelPalette[`${key}Channel`] = hexToRgbChannel(value);
    }
  });

  return { ...hexPalette, ...channelPalette } as ChannelPalette<T>;
}

/**
 * Adds an alpha channel to a color.
 *
 * @param {string} color - The color string in RGB channels or CSS variable format.
 * @param {number} [opacity=1] - The opacity value.
 * @returns {string} - The color string with alpha channel.
 * @throws {Error} - Throws an error if the color format is unsupported.
 *
 * @example
 * const rgbaColor = rgbaFromChannel('200 250 214', 0.8);
 * console.log(rgbaColor); // "rgba(200 250 214 / 0.8)"
 *
 * const rgbaVarColor = rgbaFromChannel('var(--palette-primary-lighterChannel)', 0.8);
 * console.log(rgbaVarColor); // "rgba(var(--palette-primary-lighterChannel) / 0.8)"
 */
function validateOpacity(opacity: string | number, color: string): string {
  const isCSSVar = (val: string) => val.includes("var(--");
  const isPercentage = (val: string) => val.trim().endsWith("%");

  const errors = {
    invalid: `[Alpha]: Invalid opacity "${opacity}" for ${color}.`,
    range: "Must be a number between 0 and 1 (e.g., 0.48).",
    format: 'Must be a percentage (e.g., "48%") or CSS variable (e.g., "var(--opacity)").',
  };

  if (typeof opacity === "string") {
    if (isPercentage(opacity)) return opacity;
    if (isCSSVar(opacity)) return `calc(${opacity} * 100%)`;

    const parsed = Number.parseFloat(opacity.trim());
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      return `${Number((parsed * 100).toFixed(2))}%`;
    }

    throw new Error(`${errors.invalid} ${errors.format}`);
  }

  if (typeof opacity === "number") {
    if (opacity >= 0 && opacity <= 1) {
      return `${Number((opacity * 100).toFixed(2))}%`;
    }
    throw new Error(`${errors.invalid} ${errors.range}`);
  }

  throw new Error(`${errors.invalid}`);
}

/**
 * Adds an alpha channel to a color.
 *
 * @returns {string} - The color string with alpha channel.
 * @throws {Error} - Throws an error if the color format is unsupported.
 *
 * @example
 * const rgbaColor = rgbaFromChannel('200 250 214', 0.8);
 * console.log(rgbaColor); // "rgba(200 250 214 / 0.8)"
 *
 * const rgbaVarColor = rgbaFromChannel('var(--palette-primary-lighterChannel)', 0.8);
 * console.log(rgbaVarColor); // "rgba(var(--palette-primary-lighterChannel) / 0.8)"
 */

export function rgbaFromChannel(color: string, opacity: string | number = 1): string {
  if (!color?.trim()) {
    throw new Error("[Alpha]: Color is undefined or empty!");
  }

  const isUnsupported =
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("rgba") ||
    (!color.includes("var") && color.includes("Channel"));

  if (isUnsupported) {
    throw new Error(
      [
        `[Alpha]: Unsupported color format "${color}"`,
        "✅ Supported formats:",
        '- RGB channels: "0 184 217"',
        '- CSS variables with "Channel" prefix: "var(--palette-common-blackChannel, #000000)"',
        "❌ Unsupported formats:",
        '- Hex: "#00B8D9"',
        '- RGB: "rgb(0, 184, 217)"',
        '- RGBA: "rgba(0, 184, 217, 1)"',
      ].join("\n")
    );
  }

  const alpha = validateOpacity(opacity, color);

  if (color.toLowerCase() === "currentcolor") {
    return `color-mix(in srgb, currentColor ${alpha}, transparent)`;
  }

  return `rgba(${color} / ${alpha})`;
}
