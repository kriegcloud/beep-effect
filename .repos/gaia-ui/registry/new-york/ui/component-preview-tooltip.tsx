"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ComponentPreviewTooltipProps {
	componentName: string;
	children: ReactNode;
	width?: number;
	height?: number;
	scale?: number;
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}

export const ComponentPreviewTooltip: FC<ComponentPreviewTooltipProps> = ({
	componentName,
	children,
	width = 300,
	height = 200,
	scale = 0.8,
	side = "top",
	className,
}) => {
	const [PreviewComponent, setPreviewComponent] = useState<FC | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let mounted = true;

		async function loadComponent() {
			setIsLoading(true);
			try {
				const module = await import(
					`@/components/previews/${componentName}/default`
				);
				if (mounted) {
					setPreviewComponent(() => module.default);
				}
			} catch (error) {
				console.error(`Failed to load preview for ${componentName}`, error);
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		}

		loadComponent();

		return () => {
			mounted = false;
		};
	}, [componentName]);

	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<span className={cn("inline-block cursor-help", className)}>
					{children}
				</span>
			</TooltipTrigger>

			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					side={side}
					sideOffset={5}
					className={cn(
						"z-50 overflow-hidden rounded-3xl border shadow-xl",
						"bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
						"text-zinc-950 dark:text-zinc-50",
						"animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
						"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					)}
					style={{
						width,
						height,
					}}
				>
					<div className="flex h-full w-full flex-col p-3">
						<div className="flex-1 overflow-hidden relative bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl">
							{isLoading ? (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
								</div>
							) : PreviewComponent ? (
								<div
									className="origin-top-left absolute top-0 left-0"
									style={{
										width: `${100 / scale}%`,
										height: `${100 / scale}%`,
										transform: `scale(${scale})`,
									}}
								>
									<div className="flex w-full h-full items-center justify-center p-4">
										<PreviewComponent />
									</div>
								</div>
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
									Preview not found
								</div>
							)}
						</div>
					</div>
					<TooltipPrimitive.Arrow
						className="fill-white dark:fill-zinc-900"
						width={11}
						height={5}
					/>
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</Tooltip>
	);
};
