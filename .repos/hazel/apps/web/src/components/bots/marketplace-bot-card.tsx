import type { IntegrationConnection } from "@hazel/domain/models"
import { useState } from "react"
import { BotAvatar } from "~/components/bots/bot-avatar"
import type { BotWithUser } from "~/db/hooks"
import IconCheck from "~/components/icons/icon-check"
import IconDownload from "~/components/icons/icon-download"
import { Button } from "~/components/ui/button"
import { getIntegrationIconUrl, groupScopesByResource, INTEGRATION_PROVIDERS } from "~/lib/bot-scopes"

type IntegrationProvider = IntegrationConnection.IntegrationProvider

export interface PublicBotWithUser extends BotWithUser {
	isInstalled: boolean
	creatorName: string
}

interface MarketplaceBotCardProps {
	bot: PublicBotWithUser
	onInstall: () => void
}

export function MarketplaceBotCard({ bot, onInstall }: MarketplaceBotCardProps) {
	const [isInstalling, setIsInstalling] = useState(false)

	const handleInstall = async () => {
		setIsInstalling(true)
		await onInstall()
		setIsInstalling(false)
	}

	const scopes = bot.scopes ?? []
	const scopeGroups = groupScopesByResource(scopes)
	const integrations = ((bot.allowedIntegrations ?? []) as IntegrationProvider[]).filter(
		(p) => INTEGRATION_PROVIDERS[p],
	)

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-bg transition-all duration-200 hover:border-border-hover hover:shadow-md">
			{/* Header */}
			<div className="flex items-start gap-3 p-4">
				<BotAvatar size="lg" bot={bot} className="shrink-0" />
				<div className="flex flex-1 flex-col gap-0.5 min-w-0">
					<h3 className="font-semibold text-fg text-sm truncate">{bot.name}</h3>
					<p className="text-muted-fg text-xs truncate">by {bot.creatorName}</p>
				</div>
			</div>

			{/* Description - fixed min height */}
			<div className="px-4">
				<p className="line-clamp-2 text-muted-fg text-sm leading-relaxed min-h-[2.5rem]">
					{bot.description || "No description provided"}
				</p>
			</div>

			{/* Permissions */}
			<div className="flex-1 px-4 py-3">
				{scopes.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{Object.entries(scopeGroups).map(([resource, actions]) => (
							<span
								key={resource}
								className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-fg"
							>
								<span className="capitalize">{resource}</span>
								<span className="mx-0.5 opacity-50">·</span>
								<span className="capitalize">{actions.join(", ")}</span>
							</span>
						))}
						{integrations.length > 0 &&
							integrations.map((provider) => (
								<span
									key={provider}
									className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5"
								>
									<img
										src={getIntegrationIconUrl(provider, 32)}
										alt={INTEGRATION_PROVIDERS[provider].label}
										title={INTEGRATION_PROVIDERS[provider].label}
										className="size-3 rounded-sm"
									/>
								</span>
							))}
					</div>
				)}
			</div>

			{/* Footer - always at bottom */}
			<div className="flex items-center justify-between border-border border-t bg-muted/20 px-4 py-3 mt-auto">
				<span className="flex items-center gap-1.5 text-muted-fg text-xs">
					<IconDownload className="size-3.5" />
					{bot.installCount.toLocaleString()}
				</span>
				{bot.isInstalled ? (
					<Button intent="outline" size="sm" isDisabled className="gap-1.5">
						<IconCheck className="size-3.5" />
						Installed
					</Button>
				) : (
					<Button intent="primary" size="sm" onPress={handleInstall} isDisabled={isInstalling}>
						{isInstalling ? "Installing..." : "Install"}
					</Button>
				)}
			</div>
		</div>
	)
}
