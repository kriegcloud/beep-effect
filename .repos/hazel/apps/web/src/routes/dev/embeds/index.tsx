import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/dev/embeds/")({
	component: RouteComponent,
})

const sections = [
	{
		name: "GitHub",
		path: "/dev/embeds/github",
		description: "GitHub webhook embed previews (PRs, issues, releases, etc.)",
	},
	{
		name: "OpenStatus",
		path: "/dev/embeds/openstatus",
		description: "OpenStatus monitor status and alert webhook embeds",
	},
	{
		name: "Railway",
		path: "/dev/embeds/railway",
		description: "Railway deployment and alert webhook embed previews",
	},
	{
		name: "Markdown Demo",
		path: "/dev/embeds/demo",
		description: "Colored text, bold, italic, code, and other markdown features",
	},
]

function RouteComponent() {
	return (
		<div className="min-h-screen bg-bg p-8">
			<div className="mx-auto max-w-2xl space-y-8">
				<div className="space-y-2">
					<h1 className="font-bold text-2xl text-fg">Embed Previews</h1>
					<p className="text-muted-fg">Development preview pages for webhook embed cards.</p>
				</div>

				<div className="grid gap-4">
					{sections.map((section) => (
						<Link
							key={section.path}
							to={section.path}
							className="block rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:border-accent hover:bg-muted"
						>
							<h2 className="font-semibold text-fg">{section.name}</h2>
							<p className="mt-1 text-muted-fg text-sm">{section.description}</p>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}
