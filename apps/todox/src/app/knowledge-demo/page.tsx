import { notFound } from "next/navigation";
import KnowledgeDemoClientPage from "./KnowledgeDemoClientPage";

const isEnronKnowledgeDemoEnabled = () => {
  const value = process.env.ENABLE_ENRON_KNOWLEDGE_DEMO;
  return value === "1" || value?.toLowerCase() === "true";
};

export default function KnowledgeDemoPage() {
  if (!isEnronKnowledgeDemoEnabled()) {
    notFound();
  }

  return <KnowledgeDemoClientPage />;
}
