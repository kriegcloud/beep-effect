"use client";

import { StarFilledIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Github } from "@/components/icons/social-icons";
import { RaisedButton } from "@/registry/new-york/ui/raised-button";

interface GitHubRepo {
	stargazers_count: number;
	html_url: string;
	name: string;
	full_name: string;
}

interface GitHubStarsButtonProps {
	repo: string;
	showLabel?: boolean;
	size?: "sm" | "default" | "lg";
	className?: string;
}

export function GitHubStarsButton({
	repo,
	showLabel = true,
	size = "sm",
	className,
}: GitHubStarsButtonProps) {
	const [starCount, setStarCount] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function fetchStars() {
			try {
				const response = await fetch(`https://api.github.com/repos/${repo}`);

				if (!response.ok) {
					throw new Error("Failed to fetch repository data");
				}

				const data: GitHubRepo = await response.json();

				if (isMounted) {
					setStarCount(data.stargazers_count);
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Error fetching GitHub stars:", error);
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		fetchStars();

		return () => {
			isMounted = false;
		};
	}, [repo]);

	return (
		<a
			href={`https://github.com/${repo}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<RaisedButton
				size={size}
				className={`group rounded-xl border-0! ${className || ""}`}
				color="#1c1c1c"
			>
				<div className="flex items-center">
					<Github />
					{showLabel && <span className="ml-1">GitHub</span>}
				</div>
				<div className="flex items-center gap-1 text-sm">
					<StarFilledIcon className="relative top-px size-4 text-white group-hover:text-yellow-300" />
					<span className="font-medium text-white">
						{isLoading ? "..." : starCount || "0"}
					</span>
				</div>
			</RaisedButton>
		</a>
	);
}
