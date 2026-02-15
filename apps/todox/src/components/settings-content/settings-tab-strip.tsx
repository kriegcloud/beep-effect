"use client";

import { settingsTabs as defaultTabs } from "@beep/todox/data/mock";
import { cn } from "@beep/todox/lib/utils";
import type { SettingsTab } from "@beep/todox/types/navigation";
import * as A from "effect/Array";
import * as F from "effect/Function";

interface SettingsTabStripProps {
  readonly tabs?: readonly SettingsTab[];
}

export function SettingsTabStrip({ tabs = defaultTabs }: SettingsTabStripProps) {
  return (
    <div className="hidden sm:flex px-4 sm:px-8">
      {F.pipe(
        tabs,
        A.map((tab) => (
          <a
            key={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab.isActive
                ? "border-primary text-shade-gray-1200"
                : "border-transparent text-shade-gray-700 hover:border-shade-gray-400 hover:text-shade-gray-1000"
            )}
            href={tab.href}
            aria-current={tab.isActive ? "page" : undefined}
          >
            {tab.label}
          </a>
        ))
      )}
    </div>
  );
}
