import type { CSSObject } from "@mui/material/styles";

/**
 * Creates a CSS object for layered background gradients or images.
 *
 * @param images - Gradient strings or image URLs.
 * @param sizes - (Optional) Background sizes for each layer. Defaults to 'cover'.
 * @param positions - (Optional) Background positions for each layer. Defaults to 'center'.
 * @param repeats - (Optional) Background repeat settings for each layer. Defaults to 'no-repeat'.
 * @returns A CSS object with styles.
 *
 * @example
 * // With gradient and image overlay
 * ...theme.mixins.bgGradient({
 *   images: [
 *     `linear-gradient(0deg, ${rgbaFromChannel(theme.vars.palette.primary.darkerChannel, 0.8)}, ${rgbaFromChannel(theme.vars.palette.primary.darkerChannel, 0.8)})`,
 *     `url(/assets/overlay.png)`,
 *   ],
 *   sizes: ['cover', '80px 80px'],
 *   positions: ['center', 'top right'],
 *   repeats: ['no-repeat', 'repeat']
 * })
 *
 * @example
 * // With a single gradient only
 * ...theme.mixins.bgGradient({
 *   images: [
 *     `linear-gradient(0deg, ${rgbaFromChannel(theme.vars.palette.primary.darkerChannel, 0.8)}, ${rgbaFromChannel(theme.vars.palette.primary.darkerChannel, 0.8)})`,
 *   ],
 * })
 */

export type BgGradientProps = {
  images: string[];
  sizes?: string[];
  positions?: string[];
  repeats?: string[];
};

export function bgGradient({ sizes, repeats, images, positions }: BgGradientProps): CSSObject {
  return {
    backgroundImage: images?.join(", "),
    backgroundSize: sizes?.join(", ") ?? "cover",
    backgroundRepeat: repeats?.join(", ") ?? "no-repeat",
    backgroundPosition: positions?.join(", ") ?? "center",
  };
}

/**
 * Creates a CSS object for a blurred background effect with optional image overlay.
 *
 * @param color - Background color with optional transparency.
 * @param blur - (Optional) Blur intensity in pixels. Defaults to 6.
 * @param imgUrl - (Optional) Background image URL to apply the blur effect on.
 * @returns A CSS object with styles.
 *
 * @example
 * // With image overlay
 * ...theme.mixins.bgBlur({
 *   color: rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.8),
 *   imgUrl: '/assets/overlay.png',
 *   blur: 8,
 * })
 *
 * @example
 * // With color only
 * ...theme.mixins.bgBlur({
 *   color: rgbaFromChannel(theme.vars.palette.background.paperChannel, 0.8),
 * })
 */

export type BgBlurProps = {
  color: string;
  blur?: number;
  imgUrl?: string;
};

export function bgBlur({ color, blur = 6, imgUrl }: BgBlurProps): CSSObject {
  if (imgUrl) {
    return {
      position: "relative",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundImage: `url(${imgUrl})`,
      "&::before": {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: "100%",
        height: "100%",
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: color,
      },
    };
  }
  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: color,
  };
}
