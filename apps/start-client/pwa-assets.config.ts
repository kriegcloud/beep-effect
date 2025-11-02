import {
  combinePresetAndAppleSplashScreens,
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...combinePresetAndAppleSplashScreens(preset, {
      resizeOptions: {
        background: "#0d5257",
      },
    }),
    apple: {
      ...preset.apple,
      resizeOptions: {
        ...preset.apple.resizeOptions,
        background: "#0d5257",
      },
    },
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        ...preset.maskable.resizeOptions,
        background: "#0d5257",
      },
    },
  },
  images: ["public/icon.svg"],
});
