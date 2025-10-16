import type { Metadata } from "next";
import { examplesManifest, getExampleMeta } from "@/features/visual-effect/lib/examples-manifest";

export const dynamicParams = false;

// Build-time helper
export async function generateStaticParams() {
  return examplesManifest.map((example) => ({ exampleId: example.id }));
}

// Dynamic metadata generation for each example route
export async function generateMetadata({ params }: { params: Promise<{ exampleId: string }> }): Promise<Metadata> {
  const { exampleId } = await params;

  try {
    const meta = getExampleMeta(exampleId);
    if (!meta) {
      return {
        title: "Example Not Found - Visual Effect",
        description: "The requested example could not be found",
      };
    }

    const title = `${meta.name}${meta.variant ? ` ${meta.variant}` : ""} - Visual Effect`;

    return {
      title,
      description: meta.description,
    };
  } catch {
    // Fallback to default metadata
    return {
      title: "Visual Effect - Interactive Effect Playground",
      description: "Interactive examples of TypeScript's beautiful Effect library",
    };
  }
}

export default function ExamplePage() {
  return null; // nothing mounts, so no state loss
}
