import { AppShell } from "@beep/todox/components/app-shell";

export default function AppLayout({ children }: { readonly children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
