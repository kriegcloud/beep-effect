"use client";

import dynamic from "next/dynamic";

const AppContent = dynamic(
  () => import("@/features/visual-effect/AppContent").then((mod) => ({ default: mod.AppContent })),
  {
    ssr: false,
  }
);

export default function ClientAppContent() {
  return <AppContent />;
}
