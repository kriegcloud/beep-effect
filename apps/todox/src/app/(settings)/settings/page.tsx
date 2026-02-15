import { ConnectionsSettingsPage } from "./ConnectionsSettingsPage";

type Props = {
  readonly searchParams?: Record<string, string | string[] | undefined> | undefined;
};

const getStringParam = (searchParams: Props["searchParams"], key: string): string | undefined => {
  const raw = searchParams?.[key];
  if (raw === undefined) return undefined;
  return typeof raw === "string" ? raw : raw[0];
};

export default function Page({ searchParams }: Props) {
  // Deep-link target for OAuth callbacks (contract-locked): /settings?settingsTab=connections
  // For MVP we render the Connections surface directly.
  const tab = getStringParam(searchParams, "settingsTab");
  if (tab !== undefined && tab !== "connections") {
    // Future-proof: keep the route valid even if someone deep-links to other tabs.
    // (We only implement connections for the MVP demo path.)
  }

  return <ConnectionsSettingsPage />;
}
