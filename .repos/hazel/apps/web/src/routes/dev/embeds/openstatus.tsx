import { buildOpenStatusEmbed, testPayloads } from "@hazel/integrations/openstatus/browser"
import { createFileRoute, Link } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds/openstatus")({
	component: RouteComponent,
})

// Generate embeds from real builders using test fixtures
// This ensures demos stay in sync with production embed output
const mockEmbeds = {
	// Recovered states
	recovered: buildOpenStatusEmbed(testPayloads.recovered),
	recovered_slow: buildOpenStatusEmbed(testPayloads.recovered_slow),

	// Error states
	error_connection: buildOpenStatusEmbed(testPayloads.error_connection),
	error_timeout: buildOpenStatusEmbed(testPayloads.error_timeout),
	error_5xx: buildOpenStatusEmbed(testPayloads.error_5xx),

	// Degraded states
	degraded_slow: buildOpenStatusEmbed(testPayloads.degraded_slow),
	degraded_partial: buildOpenStatusEmbed(testPayloads.degraded_partial),
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
						<span className="text-fg">OpenStatus</span>
					</div>
					<h1 className="font-bold text-2xl text-fg">OpenStatus Webhook Embeds</h1>
					<p className="text-muted-fg">
						Preview of OpenStatus monitor status webhook embed cards. Generated from real embed
						builders to ensure demos stay in sync with production.
					</p>
				</div>

				<EmbedSection title="Monitor Recovered">
					<EmbedPreview label="recovered" embed={mockEmbeds.recovered} />
					<EmbedPreview label="recovered_slow" embed={mockEmbeds.recovered_slow} />
				</EmbedSection>

				<EmbedSection title="Monitor Errors">
					<EmbedPreview label="error_connection" embed={mockEmbeds.error_connection} />
					<EmbedPreview label="error_timeout" embed={mockEmbeds.error_timeout} />
					<EmbedPreview label="error_5xx" embed={mockEmbeds.error_5xx} />
				</EmbedSection>

				<EmbedSection title="Monitor Degraded">
					<EmbedPreview label="degraded_slow" embed={mockEmbeds.degraded_slow} />
					<EmbedPreview label="degraded_partial" embed={mockEmbeds.degraded_partial} />
				</EmbedSection>
			</div>
		</div>
	)
}
