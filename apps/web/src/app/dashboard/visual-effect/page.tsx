import { DashboardContent } from "@beep/ui/layouts/dashboard/content";
import type { Metadata } from "next";
import ClientAppContent from "./ClientAppContent";

export const metadata: Metadata = {
  title: "Visual Effect",
};

export default function VisualEffectPage() {
  return (
    <DashboardContent>
      <ClientAppContent />
    </DashboardContent>
  );
}
