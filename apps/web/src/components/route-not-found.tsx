import { useRouter } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Button } from "~/components/ui/button"

export function RouteNotFoundComponent() {
	const router = useRouter()

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
			<div className="flex flex-col items-center gap-8">
				{/* Elegant 404 typography */}
				<motion.div
					className="relative select-none"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
				>
					<span className="text-[12rem] font-extralight leading-none tracking-tighter text-muted-fg/10">
						404
					</span>
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="bg-gradient-to-b from-fg to-muted-fg/70 bg-clip-text text-[12rem] font-extralight leading-none tracking-tighter text-transparent">
							404
						</span>
					</div>
				</motion.div>

				{/* Content */}
				<motion.div
					className="-mt-4 flex flex-col items-center gap-2 text-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<h1 className="text-lg font-medium text-fg">Page not found</h1>
					<p className="max-w-xs text-sm text-muted-fg">
						The page you're looking for doesn't exist or has been moved.
					</p>
				</motion.div>

				{/* Actions */}
				<motion.div
					className="flex gap-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<Button intent="primary" size="sm" onPress={() => router.navigate({ to: "/" })}>
						Go home
					</Button>
					<Button intent="outline" size="sm" onPress={() => router.history.back()}>
						Go back
					</Button>
				</motion.div>
			</div>
		</div>
	)
}
