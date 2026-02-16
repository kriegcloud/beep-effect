/**
 * Test payload fixtures for Railway webhook embeds.
 * Used by demo pages and tests to ensure embed previews match production.
 */
import type { RailwayPayload } from "../payloads.ts"

// Base resource fixtures
const baseResource = {
	workspace: { id: "ws-123", name: "Hazel Team" },
	project: { id: "proj-456", name: "hazel-app" },
}

const productionEnv = { id: "env-prod", name: "production" }
const stagingEnv = { id: "env-staging", name: "staging" }
const developmentEnv = { id: "env-dev", name: "development" }

// Service fixtures
const apiService = { id: "svc-api", name: "api-service" }
const webService = { id: "svc-web", name: "web-frontend" }
const workerService = { id: "svc-worker", name: "worker-service" }
const processorService = { id: "svc-processor", name: "data-processor" }
const batchService = { id: "svc-batch", name: "batch-processor" }
const cacheService = { id: "svc-cache", name: "cache-service" }
const migratorService = { id: "svc-migrator", name: "database-migrator" }
const oldService = { id: "svc-old", name: "old-service" }
const devServer = { id: "svc-dev", name: "dev-server" }

/**
 * Test payloads for all Railway event types.
 */
export const testPayloads = {
	// Deployment success states
	deployed: {
		type: "Deployment.deployed",
		details: {
			branch: "main",
			commitHash: "a3f2d1e7890abcdef1234567890abcdef",
			commitMessage: "feat: add webhook support",
			commitAuthor: "johndoe",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: apiService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	redeployed: {
		type: "Deployment.redeployed",
		details: {
			branch: "develop",
			commitHash: "b4c5e8f1234567890abcdef1234567890",
			commitMessage: "fix: resolve CSS issues",
		},
		resource: {
			...baseResource,
			environment: stagingEnv,
			service: webService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	// Deployment error states
	crashed: {
		type: "Deployment.crashed",
		details: {
			branch: "main",
			commitHash: "c7d9a2b1234567890abcdef1234567890",
			commitMessage: "refactor: update dependencies",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: workerService,
		},
		severity: "ERROR",
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	oom_killed: {
		type: "Deployment.oomKilled",
		details: {
			branch: "main",
		},
		resource: {
			workspace: { id: "ws-456", name: "Analytics Team" },
			project: { id: "proj-789", name: "analytics" },
			environment: productionEnv,
			service: processorService,
		},
		severity: "CRITICAL",
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	failed: {
		type: "Deployment.failed",
		details: {
			branch: "feature/new-api",
			commitHash: "e1f2g3h1234567890abcdef1234567890",
			commitMessage: "WIP: new endpoint",
		},
		resource: {
			...baseResource,
			environment: stagingEnv,
			service: { id: "svc-backend", name: "backend-api" },
		},
		severity: "ERROR",
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	// Deployment progress states
	building: {
		type: "Deployment.building",
		details: {
			branch: "main",
			commitHash: "d8e9f0a1234567890abcdef1234567890",
			commitMessage: "chore: update build config",
			source: "Manual Deploy",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: { id: "svc-webapp", name: "web-app" },
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	deploying: {
		type: "Deployment.deploying",
		details: {
			branch: "main",
			commitHash: "f1a2b3c1234567890abcdef1234567890",
			commitMessage: "feat: add rate limiting",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: { id: "svc-gateway", name: "api-gateway" },
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	restarted: {
		type: "Deployment.restarted",
		details: {
			branch: "main",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: cacheService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	// Deployment pending states
	queued: {
		type: "Deployment.queued",
		details: {
			branch: "develop",
			commitHash: "g4h5i6j1234567890abcdef1234567890",
			commitMessage: "feat: add batch support",
		},
		resource: {
			...baseResource,
			environment: stagingEnv,
			service: batchService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	needs_approval: {
		type: "Deployment.needsApproval",
		details: {
			branch: "main",
			commitHash: "h7i8j9k1234567890abcdef1234567890",
			commitMessage: "migration: add new tables",
		},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: migratorService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	// Deployment neutral states
	removed: {
		type: "Deployment.removed",
		details: {},
		resource: {
			...baseResource,
			environment: stagingEnv,
			service: oldService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	slept: {
		type: "Deployment.slept",
		details: {},
		resource: {
			...baseResource,
			environment: developmentEnv,
			service: devServer,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	// Alert states
	alert_triggered: {
		type: "VolumeAlert.triggered",
		details: {},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: apiService,
		},
		severity: "WARNING",
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,

	alert_resolved: {
		type: "VolumeAlert.resolved",
		details: {},
		resource: {
			...baseResource,
			environment: productionEnv,
			service: apiService,
		},
		timestamp: new Date().toISOString(),
	} satisfies RailwayPayload,
}

export type TestPayloadKey = keyof typeof testPayloads
