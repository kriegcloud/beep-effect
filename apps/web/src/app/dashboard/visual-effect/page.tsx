import type { Metadata } from "next";
import ClientAppContent from "./ClientAppContent";

export const metadata: Metadata = {
  title: "Visual Effect",
};

export default function VisualEffectPage() {
  return <ClientAppContent />;
}
