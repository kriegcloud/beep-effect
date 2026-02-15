"use client";

import {
	AttachmentIcon,
	HugeiconsIcon,
	Image01Icon,
	Link01Icon,
} from "@/components/icons";
import {
	Composer,
	type ComposerContextOption,
	type Tool,
} from "@/registry/new-york/ui/composer";

// Example tools for the slash command dropdown
const exampleTools: Tool[] = [
	{
		name: "web_search",
		category: "search",
		description: "Search the web for information",
	},
	{
		name: "image_generation",
		category: "creative",
		description: "Generate images from text descriptions",
	},
	{
		name: "code_interpreter",
		category: "development",
		description: "Write and execute code",
	},
	{
		name: "file_analysis",
		category: "documents",
		description: "Analyze uploaded documents",
	},
	{
		name: "calendar_events",
		category: "productivity",
		description: "Manage calendar events",
	},
	{
		name: "email_compose",
		category: "communication",
		description: "Draft and send emails",
	},
];

// Example context options for the plus button dropdown
const contextOptions: ComposerContextOption[] = [
	{
		id: "attach",
		label: "Attach Files",
		description: "Upload documents, images, or other files",
		icon: <HugeiconsIcon icon={AttachmentIcon} size={18} />,
		onClick: () => console.log("Attach files clicked"),
	},
	{
		id: "image",
		label: "Add Image",
		description: "Upload or generate an image",
		icon: <HugeiconsIcon icon={Image01Icon} size={18} />,
		onClick: () => console.log("Add image clicked"),
	},
	{
		id: "link",
		label: "Add Link",
		description: "Paste a URL for analysis",
		icon: <HugeiconsIcon icon={Link01Icon} size={18} />,
		onClick: () => console.log("Add link clicked"),
	},
];

export default function ComposerDefault() {
	return (
		<div className="w-full max-w-2xl mx-auto">
			<Composer
				placeholder="What can I do for you today?"
				tools={exampleTools}
				contextOptions={contextOptions}
				onSubmit={(message) => {
					console.log("Message sent:", message);
				}}
				onToolSelect={(tool) => {
					console.log("Tool selected:", tool);
				}}
			/>
		</div>
	);
}
