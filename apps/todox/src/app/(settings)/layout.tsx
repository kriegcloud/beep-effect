"use client";

import { AppShell } from "@beep/todox/components/app-shell";
import { SettingsNav } from "@beep/todox/components/settings-nav";

export default function SettingsLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        <SettingsNav />
        <div className="grid w-full flex-1 overflow-x-hidden transition-all duration-300">
          <div className="flex h-full flex-col overflow-hidden">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
