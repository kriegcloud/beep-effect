"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Books02Icon, HugeiconsIcon } from "../icons";
import { RaisedButton } from "@/registry/new-york/ui/raised-button";
import Image from "next/image";
import Link from "next/link";

interface TocEntry {
	id: string;
	text: string;
	level: number;
}

interface TableOfContentsProps {
	toc: TocEntry[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
	const [activeId, setActiveId] = React.useState<string>("");

	React.useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{ rootMargin: "-80px 0% -80% 0%" },
		);

		const headings = document.querySelectorAll("h2, h3, h4");
		headings.forEach((heading) => {
			observer.observe(heading);
		});

		return () => {
			headings.forEach((heading) => {
				observer.unobserve(heading);
			});
		};
	}, []);

	if (!toc || toc.length === 0) {
		return null;
	}

	return (
		<div>
			<p className="text-xs text-muted-foreground font-medium inline-flex gap-1">
				<HugeiconsIcon icon={Books02Icon} size={15} />
				On This Page
			</p>
			<nav>
				<ul className="m-0 list-none">
					{toc.map((item, index) => (
						<li
							key={`${item.id}-${index}`}
							className={cn("mt-0 pt-2", {
								"pl-4": item.level === 3,
								"pl-8": item.level === 4,
							})}
						>
							<a
								href={`#${item.id}`}
								onClick={(e) => {
									e.preventDefault();
									document.getElementById(item.id)?.scrollIntoView({
										behavior: "smooth",
									});
								}}
								className={cn(
									"inline-block no-underline transition-colors hover:text-foreground text-xs",
									activeId === item.id
										? "font-medium text-foreground"
										: "text-muted-foreground",
								)}
							>
								{item.text}
							</a>
						</li>
					))}
				</ul>
			</nav>

			<Link href={"https://heygaia.io"}>
				<div className="p-3 rounded-2xl bg-muted mt-10 mr-4 space-y-1 hover:bg-muted-foreground/25 transition hover:-translate-y-2">
					<Image
						src={"/media/wallpapers/web.webp"}
						alt="Website screenshot"
						className="rounded-2xl mb-2"
						width={1000}
						height={1000}
					/>
					<div className="text-lg font-semibold">Meet GAIA</div>
					<div className="text-xs text-muted-foreground font-light">
						Your open-source, proactive personal AI assistant with 200+
						integrations. GAIA combines todos, goals, calendar, and email into
						one system, turns tasks into automated workflows, and completes work
						instead of just tracking it. Open-source and self-hostable with
						support for custom automations and multi-step workflows.
					</div>
					<RaisedButton
						color="#00bbff"
						size={"sm"}
						className="text-black! rounded-xl mt-2 w-full"
					>
						Sign Up
					</RaisedButton>
				</div>
			</Link>
		</div>
	);
}
