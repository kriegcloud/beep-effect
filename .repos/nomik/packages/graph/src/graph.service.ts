import { type GraphConfig, getLogger } from '@nomik/core';
import type { GraphNode, GraphEdge, ProjectNode } from '@nomik/core';
import { createNeo4jDriver } from './drivers/neo4j.driver.js';
import type { GraphDriver } from './drivers/driver.interface.js';
import { upsertNodes, createEdges, clearFileData, clearFilesData, purgeStaleFiles, upsertProject, deleteProjectData, listProjects, getProject } from './queries/write.js';
import { impactAnalysis, findDeadCode, findGodObjects, findGodFiles, findDuplicates, graphStats, findDependencyChain, findDetailedPath, recentChanges, findDBImpact, getFileSymbols, explainSymbol, findServiceLinks, getOnboardSummary, detectCommunities, detectFlows, architectureDiff, evaluateRules, findTestImpact, findTestImpactForFiles } from './queries/read.js';
import { initializeSchema } from './schema/init.js';
import { QueryCache } from './cache.js';
import type { ImpactResult, DetailedPath, FileSymbol, ExplainResult, ServiceLink, OnboardSummary, CommunityResult, FlowResult, DiffResult, FullStats, RulesConfig, RuleResult, TestImpactResult } from './queries/read.js';

export interface ParseResult {
    file: { id: string; path: string; language: string; hash: string; size: number; lastParsed: string; type: 'file' };
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface GraphService {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    initSchema(): Promise<void>;
    /** @deprecated Use ingestBatch to preserve cross-file edges */
    ingestFileData(nodes: GraphNode[], edges: GraphEdge[], filePath: string, projectId: string): Promise<void>;
    /** 3-phase ingestion: clear → upsert → edges (preserves cross-file edges) */
    ingestBatch(results: ParseResult[], projectId: string): Promise<void>;
    getImpact(symbolName: string, depth?: number, projectId?: string, minConfidence?: number): Promise<ImpactResult[]>;
    getFileSymbols(filePath: string, projectId?: string): Promise<FileSymbol[]>;
    getDeadCode(projectId?: string): Promise<Array<{ name: string; filePath: string }>>;
    getGodObjects(threshold?: number, projectId?: string): Promise<Array<{ name: string; filePath: string; depCount: number }>>;
    getDBImpact(table: string, column?: string, limit?: number, projectId?: string): Promise<{ table: string; column?: string; readers: Array<{ sourceName: string; sourceType: string; filePath: string }>; writers: Array<{ sourceName: string; sourceType: string; filePath: string; operation?: string }>; columns: string[] }>;
    getGodFiles(threshold?: number, projectId?: string): Promise<Array<{ filePath: string; functionCount: number; totalLines: number }>>;
    getDuplicates(projectId?: string): Promise<Array<{ bodyHash: string; count: number; functions: Array<{ name: string; filePath: string }> }>>;
    getStats(projectId?: string): Promise<FullStats>;
    getDependencyChain(from: string, to: string, projectId?: string): Promise<string[][]>;
    getDetailedPath(from: string, to: string, projectId?: string): Promise<DetailedPath[]>;
    getRecentChanges(since: string, limit?: number, projectId?: string): Promise<Array<{ name: string; type: string; filePath: string; updatedAt: string; createdAt: string | null }>>;
    getExplain(symbolName: string, projectId?: string): Promise<ExplainResult>;
    getServiceLinks(projectId?: string): Promise<ServiceLink[]>;
    getOnboard(projectId?: string): Promise<OnboardSummary>;
    getCommunities(projectId?: string, minSize?: number): Promise<CommunityResult>;
    getFlows(projectId?: string, maxDepth?: number, limit?: number): Promise<FlowResult>;
    getDiff(fromSha: string, toSha: string, projectId?: string): Promise<DiffResult>;
    evaluateRules(config?: RulesConfig, projectId?: string): Promise<{ passed: boolean; results: RuleResult[]; summary: { errors: number; warnings: number; info: number } }>;
    getTestImpact(symbolName: string, maxDepth?: number, projectId?: string): Promise<TestImpactResult>;
    getTestImpactForFiles(filePaths: string[], projectId?: string): Promise<Array<{ testFile: string; changedFile: string; reason: string }>>;
    healthCheck(): Promise<boolean>;
    executeQuery<T>(query: string, params?: Record<string, any>): Promise<T[]>;
    createProject(project: ProjectNode): Promise<void>;
    listProjects(): Promise<ProjectNode[]>;
    getProject(projectId: string): Promise<ProjectNode | null>;
    deleteProject(projectId: string): Promise<void>;
}

/** Creates a graph service with TTL cache on reads */
export function createGraphService(config: GraphConfig): GraphService {
    const logger = getLogger();
    const driver: GraphDriver = createNeo4jDriver(config);
    const cache = new QueryCache(30_000, 200);

    /** Cache helper: returns cached value if available, otherwise executes and stores */
    async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
        const hit = cache.get<T>(key);
        if (hit !== undefined) {
            logger.debug({ cacheKey: key }, 'cache hit');
            return hit;
        }
        const result = await fn();
        cache.set(key, result);
        return result;
    }

    return {
        async connect() {
            await driver.connect();
        },

        async disconnect() {
            await driver.disconnect();
        },

        async initSchema() {
            await initializeSchema(driver);
            logger.info('graph schema initialized');
        },

        async ingestFileData(nodes: GraphNode[], edges: GraphEdge[], filePath: string, projectId: string) {
            await clearFileData(driver, filePath, projectId);
            await upsertNodes(driver, nodes, projectId);
            await createEdges(driver, edges, projectId);
            cache.invalidateAll();
            logger.debug({ filePath, projectId, nodes: nodes.length, edges: edges.length }, 'ingested file data');
        },

        async ingestBatch(results, projectId: string) {
            // Phase 0: Purge stale files (excluded, deleted, renamed)
            const currentPaths = results.map(r => r.file.path);
            await purgeStaleFiles(driver, currentPaths, projectId);
            logger.debug({ projectId }, 'purged stale files from previous scans');

            // Phase 1: Clear old data for ALL files first
            await clearFilesData(driver, currentPaths, projectId);

            // Phase 2: Create ALL nodes (result.nodes already includes FileNode)
            const allNodes: GraphNode[] = [];
            for (const r of results) allNodes.push(...r.nodes);
            await upsertNodes(driver, allNodes, projectId);

            // Phase 3: Create ALL edges (intra + cross-file preserved)
            const allEdges: GraphEdge[] = [];
            for (const r of results) {
                allEdges.push(...r.edges);
            }
            await createEdges(driver, allEdges, projectId);
            cache.invalidateAll();
            logger.info({ files: results.length, nodes: allNodes.length, edges: allEdges.length }, 'batch ingestion complete (3-phase)');
        },

        async getImpact(symbolName: string, depth = 5, projectId?: string, minConfidence = 0) {
            return cached(`impact:${projectId}:${symbolName}:${depth}:${minConfidence}`, () => impactAnalysis(driver, symbolName, depth, projectId, minConfidence));
        },

        async getFileSymbols(filePath: string, projectId?: string) {
            return cached(`fileSymbols:${projectId}:${filePath}`, () => getFileSymbols(driver, filePath, projectId));
        },

        async getDeadCode(projectId?: string) {
            return cached(`deadCode:${projectId}`, () => findDeadCode(driver, projectId));
        },

        async getGodObjects(threshold = 15, projectId?: string) {
            return cached(`godObjects:${projectId}:${threshold}`, () => findGodObjects(driver, threshold, projectId));
        },

        async getDBImpact(table: string, column?: string, limit = 100, projectId?: string) {
            return cached(`dbImpact:${projectId}:${table}:${column ?? ''}:${limit}`, () => findDBImpact(driver, table, column, limit, projectId));
        },

        async getGodFiles(threshold = 10, projectId?: string) {
            return cached(`godFiles:${projectId}:${threshold}`, () => findGodFiles(driver, threshold, projectId));
        },

        async getDuplicates(projectId?: string) {
            return cached(`duplicates:${projectId}`, () => findDuplicates(driver, projectId));
        },

        async getStats(projectId?: string) {
            return cached(`stats:${projectId}`, () => graphStats(driver, projectId));
        },

        async getDependencyChain(from: string, to: string, projectId?: string) {
            return cached(`depChain:${projectId}:${from}:${to}`, () => findDependencyChain(driver, from, to, projectId));
        },

        async getDetailedPath(from: string, to: string, projectId?: string) {
            return cached(`detailedPath:${projectId}:${from}:${to}`, () => findDetailedPath(driver, from, to, projectId));
        },

        async getRecentChanges(since: string, limit = 50, projectId?: string) {
            return cached(`recent:${projectId}:${since}:${limit}`, () => recentChanges(driver, since, limit, projectId));
        },

        async getExplain(symbolName: string, projectId?: string) {
            return cached(`explain:${projectId}:${symbolName}`, () => explainSymbol(driver, symbolName, projectId));
        },

        async getServiceLinks(projectId?: string) {
            return cached(`serviceLinks:${projectId}`, () => findServiceLinks(driver, projectId));
        },

        async getOnboard(projectId?: string) {
            return cached(`onboard:${projectId}`, () => getOnboardSummary(driver, projectId));
        },

        async getCommunities(projectId?: string, minSize = 3) {
            return cached(`communities:${projectId}:${minSize}`, () => detectCommunities(driver, projectId, minSize));
        },

        async getFlows(projectId?: string, maxDepth = 8, limit = 20) {
            return cached(`flows:${projectId}:${maxDepth}:${limit}`, () => detectFlows(driver, projectId, maxDepth, limit));
        },

        async getDiff(fromSha: string, toSha: string, projectId?: string) {
            return architectureDiff(driver, fromSha, toSha, projectId);
        },

        async evaluateRules(config?: RulesConfig, projectId?: string) {
            return evaluateRules(driver, config, projectId);
        },

        async getTestImpact(symbolName: string, maxDepth = 4, projectId?: string) {
            return cached(`testImpact:${projectId}:${symbolName}:${maxDepth}`, () => findTestImpact(driver, symbolName, maxDepth, projectId));
        },

        async getTestImpactForFiles(filePaths: string[], projectId?: string) {
            return findTestImpactForFiles(driver, filePaths, projectId);
        },

        async healthCheck() {
            return driver.healthCheck();
        },

        async executeQuery<T>(query: string, params?: Record<string, any>) {
            return driver.runQuery<T>(query, params);
        },

        async createProject(project: ProjectNode) {
            await upsertProject(driver, project);
            cache.invalidateAll();
            logger.info({ projectId: project.id, name: project.name }, 'project created');
        },

        async listProjects() {
            return cached('projects:list', () => listProjects(driver));
        },

        async getProject(projectId: string) {
            return getProject(driver, projectId);
        },

        async deleteProject(projectId: string) {
            await deleteProjectData(driver, projectId);
            cache.invalidateAll();
            logger.info({ projectId }, 'project deleted');
        },
    };
}
