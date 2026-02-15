import type * as React from "react";
import { getPreviewComponent } from "@/components/previews";
import { getSourceCode } from "@/lib/source";
import { ComponentPreviewClient } from "./component-preview-client";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
	name?: string;
	code?: string;
	children?: React.ReactNode;
}

/**
 * Server component for component preview
 * Reads source code and dynamically loads preview component
 */
export async function ComponentPreview({
	name,
	code,
	children,
	...props
}: ComponentPreviewProps) {
	let sourceCode = code || "";
	let PreviewComponent = null;

	// If name is provided, read code and dynamically load component
	// Name format: component/variant (e.g., "navbar-menu/basic")
	if (name) {
		const previewPath = `components/previews/${name}.tsx`;
		sourceCode = getSourceCode(previewPath);
		PreviewComponent = await getPreviewComponent(name);
	}

	return (
		<ComponentPreviewClient code={sourceCode} {...props}>
			{PreviewComponent ? <PreviewComponent /> : children}
		</ComponentPreviewClient>
	);
}
