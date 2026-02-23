import { cookies } from "next/headers";
import { defaultSettings, SETTINGS_STORAGE_KEY } from "./settings-config";
import type { SettingsState } from "./types";

export async function detectSettings(storageKey: string = SETTINGS_STORAGE_KEY): Promise<SettingsState> {
  const cookieStore = await cookies();

  const settingsStore = cookieStore.get(storageKey);

  return settingsStore ? JSON.parse(settingsStore?.value) : defaultSettings;
}
