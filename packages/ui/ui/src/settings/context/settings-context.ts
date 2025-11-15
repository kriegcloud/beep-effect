"use client";

import type { SettingsContextValue } from "@beep/ui-core/settings/types";
import { createContext } from "react";

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);
