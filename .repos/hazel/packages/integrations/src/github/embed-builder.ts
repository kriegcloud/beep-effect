import type { Schema } from "effect"
import { INTEGRATION_BOT_CONFIGS } from "../common/bot-configs.ts"
import type { MessageEmbed } from "../common/embed-types.ts"
import { GITHUB_COLORS } from "./colors.ts"
import type {
	GitHubDeploymentStatusPayload,
	GitHubEventType,
	GitHubIssuesPayload,
	GitHubLabel,
	GitHubMilestonePayload,
	GitHubPullRequestPayload,
	GitHubPushPayload,
	GitHubReleasePayload,
	GitHubStarPayload,
	GitHubWorkflowRunPayload,
} from "./payloads.ts"

// Infer the GitHubLabel type from the schema
type GitHubLabelType = Schema.Schema.Type<typeof GitHubLabel>

const githubConfig = INTEGRATION_BOT_CONFIGS.github

/**
 * Build embed for push event.
 * Returns null for 0-commit pushes that aren't branch/tag creations.
 */
export function buildPushEmbed(payload: GitHubPushPayload): MessageEmbed | null {
	const commits = payload.commits ?? []
	const ref = payload.ref ?? ""
	const isTag = ref.startsWith("refs/tags/")
	const refName = ref.replace("refs/heads/", "").replace("refs/tags/", "")
	const repository = payload.repository
	const sender = payload.sender
	const commitCount = commits.length

	// Detect branch/tag creation (before is all zeros)
	const isCreated = payload.before === "0000000000000000000000000000000000000000"

	// Handle 0-commit cases
	if (commitCount === 0) {
		if (isCreated) {
			// Branch/tag created
			const badgeText = isTag ? "Tag Created" : "Branch Created"
			const description = isTag ? `Tag **${refName}** created` : `Branch **${refName}** created`

			return {
				title: repository.full_name,
				description,
				url: repository.html_url,
				color: GITHUB_COLORS.push,
				author: sender
					? {
							name: sender.login,
							url: sender.html_url,
							iconUrl: sender.avatar_url,
						}
					: undefined,
				footer: {
					text: "GitHub",
					iconUrl: githubConfig.avatarUrl,
				},
				timestamp: new Date().toISOString(),
				badge: { text: badgeText, color: GITHUB_COLORS.push },
			}
		}
		// Skip other 0-commit pushes (force push without new commits, etc.)
		return null
	}

	// Build commit list for fields (max 5 commits)
	const commitFields = commits.slice(0, 5).map((commit) => {
		const message = commit.message ?? ""
		const firstLine = message.split("\n")[0] ?? ""
		return {
			name: `\`${commit.id.slice(0, 7)}\``,
			value: firstLine.slice(0, 100),
			inline: false,
		}
	})

	return {
		title: repository.full_name,
		description: `**${commitCount}** commit${commitCount !== 1 ? "s" : ""} pushed to [[${refName}]]`,
		url: payload.compare,
		color: GITHUB_COLORS.push,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: "GitHub",
			iconUrl: githubConfig.avatarUrl,
		},
		fields: commitFields.length > 0 ? commitFields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: "Push", color: GITHUB_COLORS.push },
	}
}

/**
 * Build embed for pull request event.
 */
export function buildPullRequestEmbed(payload: GitHubPullRequestPayload): MessageEmbed {
	const pr = payload.pull_request
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender

	// Determine color and badge based on action
	let color: number
	let badge: string
	if (pr.merged) {
		color = GITHUB_COLORS.pr_merged
		badge = "Merged"
	} else if (action === "closed") {
		color = GITHUB_COLORS.pr_closed
		badge = "Closed"
	} else if (pr.draft) {
		color = GITHUB_COLORS.pr_draft
		badge = "Draft"
	} else if (action === "ready_for_review") {
		color = GITHUB_COLORS.pr_ready
		badge = "Ready"
	} else {
		color = GITHUB_COLORS.pr_opened
		badge = action.charAt(0).toUpperCase() + action.slice(1)
	}

	// Build fields with improved formatting
	const fields = []

	// Diff stats with colored text
	if (pr.additions !== undefined && pr.deletions !== undefined) {
		const totalChanges = pr.additions + pr.deletions
		fields.push({
			name: "Diff",
			value: `{green:+${pr.additions}} {red:-${pr.deletions}} (${totalChanges} lines)`,
			inline: true,
		})
	}

	// Labels with GitHub colors encoded
	if (pr.labels && pr.labels.length > 0) {
		const labelText = pr.labels
			.slice(0, 3)
			.map((l: GitHubLabelType) => `[[${l.name}]]`)
			.join(" ")
		const moreCount = pr.labels.length > 3 ? ` +${pr.labels.length - 3}` : ""
		fields.push({
			name: "Labels",
			value: labelText + moreCount,
			inline: true,
		})
	}

	return {
		title: `#${pr.number} ${pr.title}`,
		description: pr.body ? `${pr.body.slice(0, 200)}${pr.body.length > 200 ? "..." : ""}` : undefined,
		url: pr.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: badge, color },
	}
}

/**
 * Build embed for issues event.
 */
export function buildIssueEmbed(payload: GitHubIssuesPayload): MessageEmbed {
	const issue = payload.issue
	const action = payload.action
	const repository = payload.repository
	const sender = payload.sender

	// Determine color and badge
	let color: number
	let badge: string
	if (action === "closed") {
		color = GITHUB_COLORS.issue_closed
		badge = "Closed"
	} else if (action === "reopened") {
		color = GITHUB_COLORS.issue_reopened
		badge = "Reopened"
	} else {
		color = GITHUB_COLORS.issue_opened
		badge = action.charAt(0).toUpperCase() + action.slice(1)
	}

	// Build fields with improved formatting
	const fields = []
	if (issue.labels && issue.labels.length > 0) {
		const labelText = issue.labels
			.slice(0, 3)
			.map((l: GitHubLabelType) => `[[${l.name}]]`)
			.join(" ")
		const moreCount = issue.labels.length > 3 ? ` +${issue.labels.length - 3}` : ""
		fields.push({
			name: "Labels",
			value: labelText + moreCount,
			inline: true,
		})
	}

	return {
		title: `#${issue.number} ${issue.title}`,
		description: issue.body
			? `${issue.body.slice(0, 200)}${issue.body.length > 200 ? "..." : ""}`
			: undefined,
		url: issue.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: badge, color },
	}
}

/**
 * Build embed for release event.
 */
export function buildReleaseEmbed(payload: GitHubReleasePayload): MessageEmbed {
	const release = payload.release
	const repository = payload.repository
	const sender = payload.sender

	return {
		title: `${release.name || release.tag_name}`,
		description: release.body
			? `${release.body.slice(0, 300)}${release.body.length > 300 ? "..." : ""}`
			: undefined,
		url: release.html_url,
		color: GITHUB_COLORS.release,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: [
			{
				name: "Tag",
				value: release.tag_name,
				type: "badge",
				options: { intent: "primary" },
				inline: true,
			},
			...(release.prerelease
				? [
						{
							name: "Pre-release",
							value: "Pre-release",
							type: "badge" as const,
							options: { intent: "warning" as const },
							inline: true,
						},
					]
				: []),
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Release", color: GITHUB_COLORS.release },
	}
}

/**
 * Build embed for deployment status event.
 */
export function buildDeploymentEmbed(payload: GitHubDeploymentStatusPayload): MessageEmbed {
	const deploymentStatus = payload.deployment_status
	const deployment = payload.deployment
	const repository = payload.repository
	const sender = payload.sender

	const state = deploymentStatus.state
	let color: number
	if (state === "success") {
		color = GITHUB_COLORS.deployment_success
	} else if (state === "failure" || state === "error") {
		color = GITHUB_COLORS.deployment_failure
	} else {
		color = GITHUB_COLORS.deployment_pending
	}

	return {
		title: `Deployment ${state}`,
		description: deploymentStatus.description ?? undefined,
		url: deploymentStatus.target_url || deployment.url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: [
			{
				name: "Environment",
				value: deployment.environment,
				type: "badge",
				options: { intent: "info" },
				inline: true,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: `Deployment ${state}`, color },
	}
}

/**
 * Build embed for workflow run event.
 */
export function buildWorkflowRunEmbed(payload: GitHubWorkflowRunPayload): MessageEmbed {
	const workflowRun = payload.workflow_run
	const repository = payload.repository
	const sender = payload.sender

	const conclusion = workflowRun.conclusion
	let color: number
	let badgeText: string
	let statusIcon: string

	if (conclusion === "success") {
		color = GITHUB_COLORS.workflow_success
		badgeText = "Passed"
		statusIcon = "passed"
	} else if (conclusion === "failure") {
		color = GITHUB_COLORS.workflow_failure
		badgeText = "Failed"
		statusIcon = "failed"
	} else if (conclusion === "cancelled") {
		color = GITHUB_COLORS.workflow_cancelled
		badgeText = "Cancelled"
		statusIcon = "cancelled"
	} else {
		color = GITHUB_COLORS.workflow_pending
		badgeText = workflowRun.status === "in_progress" ? "Running" : "Pending"
		statusIcon = "pending"
	}

	// Format duration if available
	const startedAt = workflowRun.run_started_at ? new Date(workflowRun.run_started_at) : null
	const updatedAt = workflowRun.updated_at ? new Date(workflowRun.updated_at) : null
	let duration: string | undefined
	if (startedAt && updatedAt) {
		const durationMs = updatedAt.getTime() - startedAt.getTime()
		const minutes = Math.floor(durationMs / 60000)
		const seconds = Math.floor((durationMs % 60000) / 1000)
		duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
	}

	// Build fields
	const fields: Array<{ name: string; value: string; type?: "text" | "badge"; inline?: boolean }> = []
	if (workflowRun.head_branch) {
		fields.push({
			name: "Branch",
			value: workflowRun.head_branch,
			type: "badge",
			inline: true,
		})
	}
	if (duration) {
		fields.push({
			name: "Duration",
			value: duration,
			inline: true,
		})
	}
	fields.push({
		name: "Run",
		value: `#${workflowRun.run_number}`,
		inline: true,
	})

	return {
		title: workflowRun.name,
		description: `Workflow ${statusIcon === "passed" ? "completed successfully" : statusIcon === "failed" ? "failed" : statusIcon === "cancelled" ? "was cancelled" : "is running"}`,
		url: workflowRun.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields,
		timestamp: new Date().toISOString(),
		badge: { text: badgeText, color },
	}
}

/**
 * Format a number with compact notation (e.g., 1.2k, 5.4M)
 */
function formatCompactNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`
	}
	return num.toString()
}

/**
 * Build embed for star event.
 */
export function buildStarEmbed(payload: GitHubStarPayload): MessageEmbed {
	const repository = payload.repository
	const sender = payload.sender
	const action = payload.action
	const starCount = repository.stargazers_count

	const isStarred = action === "created"
	const color = isStarred ? GITHUB_COLORS.star : GITHUB_COLORS.unstar

	// Build description
	const description = isStarred
		? `**${sender?.login ?? "Someone"}** starred this repository`
		: `**${sender?.login ?? "Someone"}** unstarred this repository`

	// Build fields
	const fields: Array<{ name: string; value: string; type?: "text" | "badge"; inline?: boolean }> = []
	if (starCount !== undefined) {
		fields.push({
			name: "Total Stars",
			value: `${formatCompactNumber(starCount)} ⭐`,
			inline: true,
		})
	}
	if (repository.forks_count !== undefined) {
		fields.push({
			name: "Forks",
			value: `${formatCompactNumber(repository.forks_count)} 🔱`,
			inline: true,
		})
	}
	if (repository.language) {
		fields.push({
			name: "Language",
			value: repository.language,
			type: "badge",
			inline: true,
		})
	}

	// Use starred_at for star events, fall back to current time for unstar (which has null starred_at)
	const timestamp = payload.starred_at ?? new Date().toISOString()

	return {
		title: repository.full_name,
		description,
		url: repository.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: "GitHub",
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp,
		badge: { text: isStarred ? "Starred" : "Unstarred", color },
	}
}

/**
 * Build embed for milestone event.
 */
export function buildMilestoneEmbed(payload: GitHubMilestonePayload): MessageEmbed {
	const milestone = payload.milestone
	const repository = payload.repository
	const sender = payload.sender
	const action = payload.action

	// Determine color based on action
	let color: number
	let badgeText: string
	switch (action) {
		case "created":
			color = GITHUB_COLORS.milestone_created
			badgeText = "Created"
			break
		case "opened":
			color = GITHUB_COLORS.milestone_opened
			badgeText = "Opened"
			break
		case "closed":
			color = GITHUB_COLORS.milestone_closed
			badgeText = "Closed"
			break
		case "edited":
			color = GITHUB_COLORS.milestone_edited
			badgeText = "Edited"
			break
		case "deleted":
			color = GITHUB_COLORS.milestone_deleted
			badgeText = "Deleted"
			break
		default:
			color = GITHUB_COLORS.milestone_created
			badgeText = action.charAt(0).toUpperCase() + action.slice(1)
	}

	// Calculate progress
	const totalIssues = milestone.open_issues + milestone.closed_issues
	const progressPercent = totalIssues > 0 ? Math.round((milestone.closed_issues / totalIssues) * 100) : 0

	// Build fields
	const fields: Array<{ name: string; value: string; type?: "text" | "badge"; inline?: boolean }> = []

	// Progress field
	if (totalIssues > 0) {
		fields.push({
			name: "Progress",
			value: `${progressPercent}% (${milestone.closed_issues}/${totalIssues})`,
			inline: true,
		})
	}

	// Issues field with colored counts
	fields.push({
		name: "Issues",
		value: `{green:${milestone.closed_issues} closed} {red:${milestone.open_issues} open}`,
		inline: true,
	})

	// Due date field
	if (milestone.due_on) {
		const dueDate = new Date(milestone.due_on)
		const now = new Date()
		const isOverdue = dueDate < now && milestone.state !== "closed"
		const dueDateStr = dueDate.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})
		fields.push({
			name: "Due Date",
			value: isOverdue ? `{red:${dueDateStr} (overdue)}` : dueDateStr,
			inline: true,
		})
	}

	return {
		title: milestone.title,
		description: milestone.description
			? `${milestone.description.slice(0, 200)}${milestone.description.length > 200 ? "..." : ""}`
			: undefined,
		url: milestone.html_url,
		color,
		author: sender
			? {
					name: sender.login,
					url: sender.html_url,
					iconUrl: sender.avatar_url,
				}
			: undefined,
		footer: {
			text: `${repository.full_name}`,
			iconUrl: githubConfig.avatarUrl,
		},
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date().toISOString(),
		badge: { text: `Milestone ${badgeText}`, color },
	}
}

/**
 * Map GitHub event type to our internal event type.
 */
export function mapEventType(githubEventType: string): GitHubEventType | null {
	switch (githubEventType) {
		case "push":
			return "push"
		case "pull_request":
			return "pull_request"
		case "issues":
			return "issues"
		case "release":
			return "release"
		case "deployment_status":
			return "deployment_status"
		case "workflow_run":
			return "workflow_run"
		case "star":
			return "star"
		case "milestone":
			return "milestone"
		default:
			return null
	}
}

/**
 * Check if a push event matches the branch filter.
 */
export function matchesBranchFilter(branchFilter: string | null, ref: string | undefined): boolean {
	if (!branchFilter) return true // No filter = all branches
	if (!ref) return true

	const branch = ref.replace("refs/heads/", "")
	return branch === branchFilter
}

/**
 * Build embed for the GitHub event based on event type.
 * Returns null if the event type is not supported.
 */
export function buildGitHubEmbed(eventType: string, payload: unknown): MessageEmbed | null {
	switch (eventType) {
		case "push":
			return buildPushEmbed(payload as GitHubPushPayload)
		case "pull_request":
			return buildPullRequestEmbed(payload as GitHubPullRequestPayload)
		case "issues":
			return buildIssueEmbed(payload as GitHubIssuesPayload)
		case "release":
			return buildReleaseEmbed(payload as GitHubReleasePayload)
		case "deployment_status":
			return buildDeploymentEmbed(payload as GitHubDeploymentStatusPayload)
		case "workflow_run":
			return buildWorkflowRunEmbed(payload as GitHubWorkflowRunPayload)
		case "star":
			return buildStarEmbed(payload as GitHubStarPayload)
		case "milestone":
			return buildMilestoneEmbed(payload as GitHubMilestonePayload)
		default:
			return null
	}
}
