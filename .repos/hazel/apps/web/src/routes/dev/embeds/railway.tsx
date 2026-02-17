import { buildRailwayEmbed, testPayloads } from "@hazel/integrations/railway/browser"
import { createFileRoute, Link } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds/railway")({
	component: RouteComponent,
})

// Generate embeds from real builders using test fixtures
// This ensures demos stay in sync with production embed output
const mockEmbeds = {
	// Deployment success states
	deployed: buildRailwayEmbed(testPayloads.deployed),
	redeployed: buildRailwayEmbed(testPayloads.redeployed),

	// Deployment error states
	crashed: buildRailwayEmbed(testPayloads.crashed),
	oom_killed: buildRailwayEmbed(testPayloads.oom_killed),
	failed: buildRailwayEmbed(testPayloads.failed),

	// Deployment progress states
	building: buildRailwayEmbed(testPayloads.building),
	deploying: buildRailwayEmbed(testPayloads.deploying),
	restarted: buildRailwayEmbed(testPayloads.restarted),

	// Deployment pending states
	queued: buildRailwayEmbed(testPayloads.queued),
	needs_approval: buildRailwayEmbed(testPayloads.needs_approval),

	// Deployment neutral states
	removed: buildRailwayEmbed(testPayloads.removed),
	slept: buildRailwayEmbed(testPayloads.slept),

	// Alert states
	alert_triggered: buildRailwayEmbed(testPayloads.alert_triggered),
	alert_resolved: buildRailwayEmbed(testPayloads.alert_resolved),
}

function EmbedSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-fg text-lg">{title}</h2>
			<div className="grid gap-4 md:grid-cols-2">{children}</div>
		</div>
	)
}

function EmbedPreview({
	label,
	embed,
}: {
	label: string
	embed: (typeof mockEmbeds)[keyof typeof mockEmbeds]
}) {
	return (
		<div className="space-y-2">
			<span className="font-mono text-muted-fg text-xs">{label}</span>
			<MessageEmbeds embeds={[embed]} />
		</div>
	)
}

function RouteComponent() {
	return (
		<div className="min-h-screen bg-bg p-8">
			<div className="mx-auto max-w-5xl space-y-12">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Link to="/dev/embeds" className="text-muted-fg hover:text-fg">
							Embeds
						</Link>
						<span className="text-muted-fg">/</span>
						<span className="text-fg">Railway</span>
					</div>
					<h1 className="font-bold text-2xl text-fg">Railway Webhook Embeds</h1>
					<p className="text-muted-fg">
						Preview of Railway deployment and alert webhook embed cards. Generated from real embed
						builders to ensure demos stay in sync with production.
					</p>
				</div>

				<EmbedSection title="Deployment Success">
					<EmbedPreview label="Deployment.deployed" embed={mockEmbeds.deployed} />
					<EmbedPreview label="Deployment.redeployed" embed={mockEmbeds.redeployed} />
				</EmbedSection>

				<EmbedSection title="Deployment Errors">
					<EmbedPreview label="Deployment.crashed" embed={mockEmbeds.crashed} />
					<EmbedPreview label="Deployment.oomKilled" embed={mockEmbeds.oom_killed} />
					<EmbedPreview label="Deployment.failed" embed={mockEmbeds.failed} />
				</EmbedSection>

				<EmbedSection title="Deployment Progress">
					<EmbedPreview label="Deployment.building" embed={mockEmbeds.building} />
					<EmbedPreview label="Deployment.deploying" embed={mockEmbeds.deploying} />
					<EmbedPreview label="Deployment.restarted" embed={mockEmbeds.restarted} />
				</EmbedSection>

				<EmbedSection title="Deployment Pending">
					<EmbedPreview label="Deployment.queued" embed={mockEmbeds.queued} />
					<EmbedPreview label="Deployment.needsApproval" embed={mockEmbeds.needs_approval} />
				</EmbedSection>

				<EmbedSection title="Deployment Neutral">
					<EmbedPreview label="Deployment.removed" embed={mockEmbeds.removed} />
					<EmbedPreview label="Deployment.slept" embed={mockEmbeds.slept} />
				</EmbedSection>

				<EmbedSection title="Alerts">
					<EmbedPreview label="VolumeAlert.triggered" embed={mockEmbeds.alert_triggered} />
					<EmbedPreview label="VolumeAlert.resolved" embed={mockEmbeds.alert_resolved} />
				</EmbedSection>
			</div>
		</div>
	)
}
