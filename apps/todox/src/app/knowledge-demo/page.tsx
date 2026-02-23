import { notFound } from "next/navigation";
import KnowledgeDemoClientPage from "./KnowledgeDemoClientPage";

const isEnronKnowledgeDemoEnabled = () => {
  const value = process.env.ENABLE_ENRON_KNOWLEDGE_DEMO ?? process.env.NEXT_PUBLIC_ENABLE_ENRON_KNOWLEDGE_DEMO;
  const normalized = value?.trim().toLowerCase();

  return normalized === "1" || normalized === "true";
};

export default function KnowledgeDemoPage() {
  if (!isEnronKnowledgeDemoEnabled()) {
    notFound();
  }

  return <KnowledgeDemoClientPage />;
}
