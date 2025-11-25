"use client";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider as Provider } from "@mui/x-date-pickers/LocalizationProvider";
import { arSA, enUS, fr, type Locale, vi, zhCN } from "date-fns/locale";

import { useTranslate } from "./use-locales";

type Props = {
  readonly children: React.ReactNode;
};

// Map our locale codes to date-fns locales
const dateLocaleMap: Record<string, Locale> = {
  en: enUS,
  fr: fr,
  vi: vi,
  "zh-cn": zhCN,
  "ar-sa": arSA,
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useTranslate();
  const dateLocale =
    currentLang.adapterLocale && dateLocaleMap[currentLang.adapterLocale]
      ? dateLocaleMap[currentLang.adapterLocale]
      : enUS;

  return (
    <Provider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
      {children}
    </Provider>
  );
}
