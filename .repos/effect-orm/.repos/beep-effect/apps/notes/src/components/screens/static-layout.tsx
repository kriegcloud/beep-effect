import type * as React from "react";

export function StaticLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="h-full dark:bg-[#1F1F1F]">
      <main className="h-full overflow-x-hidden pt-32 sm:pt-40">{children}</main>
    </div>
  );
}
