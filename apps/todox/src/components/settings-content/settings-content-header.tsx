"use client";

import { ListIcon } from "@phosphor-icons/react";

export function SettingsContentHeader() {
  return (
    <div className="border-shade-gray-300 header-with-orb-glow border-b h-10 px-2 flex shrink-0 items-center justify-between">
      <button
        type="button"
        aria-label="Toggle settings panel"
        className="text-shade-gray-1000 flex !h-7 !w-7 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium transition-colors bg-shade-gray-300 hover:bg-shade-gray-400 border-shade-gray-400 hover:text-shade-gray-1200 hover:border-shade-gray-500 border"
      >
        <ListIcon className="!h-3.5 !w-3.5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
