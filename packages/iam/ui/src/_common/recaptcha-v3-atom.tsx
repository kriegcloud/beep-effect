"use client";
/**
 * ReCaptcha v3 provider using @effect-atom/atom-react.
 *
 * This replaces the context-based RecaptchaV3 provider with an atom-based approach
 * using the proper Atom.make / Atom.writable methodology:
 *
 * Lifecycle management via atoms (not useEffect):
 * - **Cleanup**: handled by `reCaptchaProviderAtom` via `get.addFinalizer()` - runs when atom unmounts
 * - **Theme updates**: handled reactively by `reCaptchaProviderAtom` reading `reCaptchaThemeConfigAtom`
 *
 * useEffect (not useLayoutEffect) for React-to-atom sync:
 * - **Init + Theme sync**: syncs React values to atoms on mount/update
 *   (uses useEffect since reCAPTCHA initialization doesn't require DOM measurement
 *    and can safely run after paint to avoid forced reflow)
 *
 * @module
 */
import {
  initializeReCaptchaAtom,
  type ReCaptchaProviderConfig,
  reCaptchaProviderAtom,
  reCaptchaThemeConfigAtom,
} from "@beep/shared-client/services/react-recaptcha-v3";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { useIsHydrated } from "@beep/ui/hooks/index";
import { useTranslate } from "@beep/ui/i18n/use-locales";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { useTheme } from "@mui/material/styles";
import * as Redacted from "effect/Redacted";
import { type ReactNode, useEffect, useRef } from "react";

/**
 * ReCaptcha v3 provider using atoms.
 *
 * This initializes the reCAPTCHA script and provides state via atoms.
 * Child components can use `useCaptchaAtom` or `useReCaptchaState` to access captcha functionality.
 *
 * Uses @effect-atom/atom-react patterns:
 * - `reCaptchaProviderAtom` handles cleanup via `get.addFinalizer()` (no useEffect cleanup needed)
 * - `reCaptchaThemeConfigAtom` drives reactive theme updates within the atom (no separate useEffect)
 * - Initialization uses `initializeReCaptchaAtom` (Effect-based for async Registry access)
 *
 * @example
 * ```tsx
 * import { RecaptchaV3Atom, useCaptchaAtom } from "@beep/iam-ui/_common";
 *
 * function App() {
 *   return (
 *     <RecaptchaV3Atom>
 *       <MyForm />
 *     </RecaptchaV3Atom>
 *   );
 * }
 *
 * function MyForm() {
 *   const { executeCaptcha, isReady } = useCaptchaAtom();
 *   // ...
 * }
 * ```
 */
export function RecaptchaV3Atom({ children }: { readonly children: ReactNode }) {
  const isHydrated = useIsHydrated();
  const theme = useTheme();
  const { currentLang } = useTranslate();
  const initializedRef = useRef(false);

  // Get atom setters
  const initialize = useAtomSet(initializeReCaptchaAtom);
  const setThemeConfig = useAtomSet(reCaptchaThemeConfigAtom);

  // Read provider atom - this mounts it and registers cleanup via addFinalizer
  // Theme updates are handled reactively within the atom by reading reCaptchaThemeConfigAtom
  // No cleanup return needed - the atom handles it via addFinalizer
  useAtomValue(reCaptchaProviderAtom);

  // Sync React values (theme, language) to atoms and initialize
  // useEffect runs asynchronously after paint - this is fine since reCAPTCHA
  // initialization doesn't require DOM measurement and avoids forced reflow
  // This is ONE effect that replaces TWO useEffects from the original:
  // 1. Initialization (runs once via ref guard)
  // 2. Theme/language sync (runs on change)
  // The cleanup is NOT here - it's handled by reCaptchaProviderAtom's addFinalizer
  const themeMode = theme.palette.mode as "dark" | "light";
  const language = currentLang?.value;

  useEffect(() => {
    // Initialize once (idempotent - the Effect checks loadedUrl to prevent re-init)
    if (!initializedRef.current && isHydrated) {
      initializedRef.current = true;
      const config: ReCaptchaProviderConfig = {
        reCaptchaKey: Redacted.value(clientEnv.captchaSiteKey),
        language,
        useEnterprise: false,
        useRecaptchaNet: false,
      };
      initialize(config);
    }

    // Sync theme config - the provider atom reads this and updates iframe reactively
    setThemeConfig({ theme: themeMode, language });
    // NO cleanup return - cleanup is handled by reCaptchaProviderAtom's get.addFinalizer()
  }, [isHydrated, themeMode, language, initialize, setThemeConfig]);

  return (
    <>
      {isHydrated && (
        <style>{`
          .grecaptcha-badge {
            visibility: hidden;
            border-radius: var(--radius) !important;
            --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
            box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
            border-style: var(--tw-border-style) !important;
            border-width: 1px;
          }

          .dark .grecaptcha-badge {
            border-color: var(--input) !important;
          }
        `}</style>
      )}
      {children}
    </>
  );
}

export default RecaptchaV3Atom;
