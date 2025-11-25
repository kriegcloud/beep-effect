"use client";
import { useRouter } from "@beep/ui/hooks";
import { toast } from "@beep/ui/molecules";
import { useSettingsContext } from "@beep/ui/settings";
import type { SupportedLangValue } from "@beep/ui-core/i18n/constants";
import { fallbackLang } from "@beep/ui-core/i18n/constants";
import { getCurrentLang } from "@beep/ui-core/i18n/locales-config";
import type { Namespace } from "i18next";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useTranslate(namespace?: Namespace | undefined) {
  const router = useRouter();
  const settings = useSettingsContext();

  const { t, i18n } = useTranslation(namespace);
  const { t: tMessages } = useTranslation("messages");

  const resolvedLanguage = (i18n.resolvedLanguage || fallbackLang) as SupportedLangValue.Type;
  const currentLang = getCurrentLang(resolvedLanguage);

  const updateDirection = useCallback(
    (lang: SupportedLangValue.Type) => {
      settings.setState({ direction: i18n.dir(lang) });
    },
    [i18n, settings]
  );

  const handleChangeLang = useCallback(
    async (lang: SupportedLangValue.Type) => {
      try {
        const changeLangPromise = i18n.changeLanguage(lang);

        toast.promise(changeLangPromise, {
          loading: tMessages("languageSwitch.loading"),
          success: () => tMessages("languageSwitch.success"),
          error: () => tMessages("languageSwitch.error"),
        });

        await changeLangPromise;

        updateDirection(lang);

        router.refresh(); // only nextjs
      } catch (error) {
        console.error(error);
      }
    },
    [i18n, router, tMessages, updateDirection]
  );

  const handleResetLang = useCallback(() => {
    void handleChangeLang(fallbackLang);
  }, [handleChangeLang]);

  return {
    t,
    i18n,
    currentLang,
    onChangeLang: handleChangeLang,
    onResetLang: handleResetLang,
  };
}

export function useLocaleDirectionSync() {
  const { i18n, currentLang } = useTranslate();
  const { state, setState } = useSettingsContext();

  const handleSync = useCallback(async () => {
    if (state.direction !== i18n.dir(currentLang.value)) {
      setState({ direction: i18n.dir(currentLang.value) });
    }

    if (i18n.resolvedLanguage !== currentLang.value) {
      await i18n.changeLanguage(currentLang.value);
    }
  }, [currentLang.value, i18n, setState, state.direction]);

  useEffect(() => {
    void handleSync();
  }, [handleSync]);

  return null;
}
