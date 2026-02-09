import { redirect } from "next/navigation";

type Props = {
  readonly searchParams?: Record<string, string | string[] | undefined> | undefined;
};

const getStringParam = (
  searchParams: Props["searchParams"],
  key: string
): string | undefined => {
  const raw = searchParams?.[key];
  if (raw === undefined) return undefined;
  return typeof raw === "string" ? raw : raw[0];
};

export default function Page({ searchParams }: Props) {
  // OAuth flows deep-link back to /settings?settingsTab=connections. The app's
  // settings UI is hosted under /dashboard with the settings dialog driven by
  // the `settingsTab` search param, so redirect while preserving all params.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v !== undefined) params.set(key, v);
  }

  const tab = getStringParam(searchParams, "settingsTab");
  if (tab === undefined) {
    redirect("/dashboard");
  }

  const qs = params.toString();
  redirect(`/dashboard${qs.length > 0 ? `?${qs}` : ""}`);
}
