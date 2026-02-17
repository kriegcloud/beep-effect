/**
 * Railway webhook payload types.
 * These types match the schema in @hazel/domain/http for use in embed builders.
 */

export interface RailwayWorkspace {
	id: string
	name: string
}

export interface RailwayProject {
	id: string
	name: string
}

export interface RailwayEnvironment {
	id: string
	name: string
	isEphemeral?: boolean
}

export interface RailwayService {
	id: string
	name: string
}

export interface RailwayDeployment {
	id: string
}

export interface RailwayResource {
	workspace: RailwayWorkspace
	project: RailwayProject
	environment?: RailwayEnvironment
	service?: RailwayService
	deployment?: RailwayDeployment
}

export interface RailwayDetails {
	id?: string
	source?: string
	status?: string
	branch?: string
	commitHash?: string
	commitAuthor?: string
	commitMessage?: string
}

export interface RailwayPayload {
	type: string // e.g., "Deployment.failed", "Alert.triggered"
	details: RailwayDetails
	resource: RailwayResource
	severity?: string // "WARNING", "ERROR", etc.
	timestamp: string // ISO 8601 timestamp
}
