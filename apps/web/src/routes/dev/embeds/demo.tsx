import { createFileRoute, Link } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds/demo")({
	component: RouteComponent,
})

// Demo embeds showcasing markdown features
const demoEmbeds = {
	colored_text: {
		title: "Colored Text",
		description:
			"Named colors: {red:red} {green:green} {blue:blue} {yellow:yellow} {purple:purple} {orange:orange} {gray:gray}",
		url: "https://example.com",
		color: 0x5865f2,
		author: {
			name: "Syntax Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{
				name: "Semantic",
				value: "{success:success} {error:error} {warning:warning} {info:info}",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Demo", color: 0x5865f2 },
	},

	diff_stats: {
		title: "Diff Stats Example",
		description: "Use colored text for git diff statistics",
		url: "https://example.com",
		color: 0x238636,
		author: {
			name: "Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{ name: "Small change", value: "{green:+12} {red:-3} (15 lines)", inline: true },
			{ name: "Medium change", value: "{green:+234} {red:-89} (323 lines)", inline: true },
			{ name: "Large change", value: "{green:+1,234} {red:-567} (1,801 lines)", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Diff", color: 0x238636 },
	},

	text_formatting: {
		title: "Text Formatting",
		description: "**Bold text** and *italic text* and ~~strikethrough~~",
		url: "https://example.com",
		color: 0x5865f2,
		author: {
			name: "Formatting Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{ name: "Bold", value: "**This is bold**", inline: true },
			{ name: "Italic", value: "*This is italic*", inline: true },
			{ name: "Strike", value: "~~This is struck~~", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Format", color: 0x5865f2 },
	},

	code_inline: {
		title: "Inline Code",
		description: "Use backticks for `inline code` like `const x = 1`",
		url: "https://example.com",
		color: 0x6e7681,
		author: {
			name: "Code Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{ name: "Variable", value: "`const foo = 'bar'`", inline: true },
			{ name: "Command", value: "`npm install`", inline: true },
			{ name: "Branch", value: "`feature/new-api`", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Code", color: 0x6e7681 },
	},

	links: {
		title: "Links",
		description: "Markdown links: [GitHub](https://github.com) and auto-linked URLs: https://example.com",
		url: "https://example.com",
		color: 0x1f6feb,
		author: {
			name: "Links Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{ name: "Markdown", value: "[Click here](https://github.com)", inline: true },
			{ name: "Auto-link", value: "https://github.com", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Links", color: 0x1f6feb },
	},

	mixed: {
		title: "Mixed Formatting",
		description: "Combine **bold**, {green:colored}, and `code` in one message",
		url: "https://example.com",
		color: 0x8957e5,
		author: {
			name: "Mixed Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{
				name: "Example 1",
				value: "**Status:** {success:Passed} in `2m 34s`",
				inline: false,
			},
			{
				name: "Example 2",
				value: "Branch `main` has {green:+500} {red:-200} changes",
				inline: false,
			},
			{
				name: "Example 3",
				value: "*Warning:* {warning:Breaking change} in **v2.0**",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Mixed", color: 0x8957e5 },
	},

	badges_basic: {
		title: "Inline Badges",
		description: "Branch [[main]] updated with new features. Version [[success:v1.0.0]] is now live!",
		url: "https://example.com",
		color: 0x3b82f6,
		author: {
			name: "Badge Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{
				name: "All Variants",
				value: "[[primary:primary]] [[secondary:secondary]] [[success:success]] [[info:info]] [[warning:warning]] [[danger:danger]] [[outline:outline]]",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Badges", color: 0x3b82f6 },
	},

	badges_use_cases: {
		title: "Badge Use Cases",
		description: "Labels: [[danger:bug]] [[primary:enhancement]] [[info:docs]]",
		url: "https://example.com",
		color: 0x10b981,
		author: {
			name: "Use Cases",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: { text: "Embed Markdown" },
		fields: [
			{
				name: "Git Branch",
				value: "Deployed from [[primary:main]] to [[success:production]]",
				inline: false,
			},
			{
				name: "Version Tags",
				value: "[[success:v2.0.0]] [[warning:beta]] [[outline:rc1]]",
				inline: false,
			},
			{
				name: "Status",
				value: "Build [[success:passed]] • Tests [[success:42 passed]] [[danger:2 failed]]",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Examples", color: 0x10b981 },
	},
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
	embed: (typeof demoEmbeds)[keyof typeof demoEmbeds]
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
						<span className="text-fg">Demo</span>
					</div>
					<h1 className="font-bold text-2xl text-fg">Markdown Demo</h1>
					<p className="text-muted-fg">Preview of all supported markdown features in embeds.</p>
				</div>

				<div className="rounded-lg border border-border bg-muted/30 p-4">
					<h3 className="font-semibold text-fg">Syntax Reference</h3>
					<div className="mt-3 grid gap-2 font-mono text-sm">
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Badge:</span>
							<code className="text-fg">{"[[text]]"}</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Badge (colored):</span>
							<code className="text-fg">{"[[intent:text]]"}</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Colored text:</span>
							<code className="text-fg">{"{color:text}"}</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Bold:</span>
							<code className="text-fg">**text**</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Italic:</span>
							<code className="text-fg">*text*</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Strikethrough:</span>
							<code className="text-fg">~~text~~</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Inline code:</span>
							<code className="text-fg">`text`</code>
						</div>
						<div className="flex gap-4">
							<span className="w-40 text-muted-fg">Link:</span>
							<code className="text-fg">[text](url)</code>
						</div>
					</div>
					<p className="mt-3 text-muted-fg text-xs">
						Badge intents: primary, secondary, success, info, warning, danger, outline
					</p>
				</div>

				<EmbedSection title="Colored Text">
					<EmbedPreview label="colors:named" embed={demoEmbeds.colored_text} />
					<EmbedPreview label="colors:diff" embed={demoEmbeds.diff_stats} />
				</EmbedSection>

				<EmbedSection title="Text Formatting">
					<EmbedPreview label="format:text" embed={demoEmbeds.text_formatting} />
					<EmbedPreview label="format:code" embed={demoEmbeds.code_inline} />
				</EmbedSection>

				<EmbedSection title="Links">
					<EmbedPreview label="links:demo" embed={demoEmbeds.links} />
				</EmbedSection>

				<EmbedSection title="Mixed Formatting">
					<EmbedPreview label="mixed:demo" embed={demoEmbeds.mixed} />
				</EmbedSection>

				<EmbedSection title="Inline Badges">
					<EmbedPreview label="badges:basic" embed={demoEmbeds.badges_basic} />
					<EmbedPreview label="badges:use-cases" embed={demoEmbeds.badges_use_cases} />
				</EmbedSection>
			</div>
		</div>
	)
}
