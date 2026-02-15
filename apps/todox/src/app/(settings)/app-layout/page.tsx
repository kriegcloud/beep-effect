"use client";

import { SettingsContentHeader, SettingsPageHeader, SettingsTabStrip } from "@beep/todox/components/settings-content";

const Page = () => {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <SettingsContentHeader />
      <div className="flex-1 overflow-auto">
        <div className="flex h-full shrink-0 grow basis-0 flex-col overflow-y-auto">
          <SettingsPageHeader />
          <SettingsTabStrip />
          <div className="flex-1 px-4 sm:px-8">
            {/* Content placeholder - will be replaced with actual settings forms */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
