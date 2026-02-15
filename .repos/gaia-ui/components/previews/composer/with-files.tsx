"use client";

import { useState } from "react";
import { Composer, type UploadedFile } from "@/registry/new-york/ui/composer";

export default function ComposerWithFiles() {
	const [files, setFiles] = useState<UploadedFile[]>([
		{
			id: "1",
			name: "document.pdf",
			type: "application/pdf",
			url: "",
		},
		{
			id: "2",
			name: "screenshot.png",
			type: "image/png",
			url: "https://github.com/aryanranderiya.png",
		},
		{
			id: "3",
			name: "data.json",
			type: "application/json",
			url: "",
		},
	]);

	const handleRemoveFile = (id: string) => {
		setFiles((prev) => prev.filter((f) => f.id !== id));
	};

	return (
		<div className="w-full max-w-2xl mx-auto">
			<Composer
				placeholder="Ask about these files..."
				attachedFiles={files}
				onRemoveFile={handleRemoveFile}
				onSubmit={(message, attachedFiles) => {
					console.log("Message:", message);
					console.log("Files:", attachedFiles);
				}}
			/>
		</div>
	);
}
