"use client";

import { useThemeMode } from "@beep/ui/hooks";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import NextImage, { type ImageProps as NextImageProps, type StaticImageData } from "next/image";

export interface ThemeAwareImageSource {
  readonly light: string | StaticImageData;
  readonly dark: string | StaticImageData;
}

interface ThemeAwareImageProps extends Omit<NextImageProps, "src" | "alt"> {
  readonly src: string | StaticImageData | ThemeAwareImageSource;
  readonly alt?: string | undefined;
  readonly sx?: SxProps<Theme> | undefined;
}

const StyledNextImage = styled(NextImage)({});

export const BaseImage = ({ src, alt = "", sx, ...props }: ThemeAwareImageProps) => {
  const { isDark } = useThemeMode();

  let imageSrc: string | StaticImageData;

  if (typeof src === "string" || (src as StaticImageData)?.src) {
    imageSrc = src as string | StaticImageData;
  } else {
    const themedSrc = src as ThemeAwareImageSource;
    imageSrc = isDark ? themedSrc.dark : themedSrc.light;
  }

  return <StyledNextImage src={imageSrc} alt={alt} sx={sx ?? {}} {...props} />;
};
