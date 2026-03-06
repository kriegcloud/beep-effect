import { Command } from 'commander';
import { createLogger, loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createParserEngine, getGitInfo } from '@nomik/parser';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig, writeProjectConfig, createProjectNode, defaultProjectName, PROJECT_CONFIG_VERSION } from '../utils/project-config.js';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Incremental scan — only re-parse files changed since the last scan (git diff).
 * Falls back to full scan if no previous scan SHA is found.
 */
export const scanIncrementalCommand = new Command('scan:incremental')
    .description('Incremental scan — only re-parse files changed since last scan (git diff)')
    .argument('<path>', 'Path to the project root')
    .option('--since <sha>', 'Git SHA to diff from (default: last scan SHA)')
    .option('--project <name>', 'Project name')
    .action(async (targetPath: string, opts: { since?: string; project?: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: { root: targetPath },
        });

        const gitInfo = getGitInfo();
        if (!gitInfo) {
            logger.error('Not a git repository — incremental scan requires git');
            return;
        }

        // Resolve project
        let localConfig = readProjectConfig();
        let projectId: string;
        if (opts.project) {
            const projNode = createProjectNode(localConfig?.projectName ?? defaultProjectName());
            projectId = projNode.id;
        } else if (localConfig) {
            projectId = localConfig.projectId;
        } else {
            const name = defaultProjectName();
            const node = createProjectNode(name);
            projectId = node.id;
            writeProjectConfig({ version: PROJECT_CONFIG_VERSION, projectId: node.id, projectName: name, createdAt: new Date().toISOString() });
            logger.info({ project: name, id: projectId }, 'auto-created project');
        }

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();
            await graph.initSchema();

            // Find the last scan SHA
            let baseSha = opts.since;
            if (!baseSha) {
                const lastScans = await graph.executeQuery<{ sha: string }>(
                    `MATCH (s:ScanMeta {projectId: $projectId})
                     RETURN s.sha as sha
                     ORDER BY s.scannedAt DESC
                     LIMIT 1`,
                    { projectId },
                );
                baseSha = lastScans[0]?.sha;
            }

            if (!baseSha) {
                logger.warn('No previous scan found — falling back to full scan');
                logger.info('Run `nomik scan <path>` for a full scan instead');
                await graph.disconnect();
                return;
            }

            // Get changed files via git diff
            const currentSha = gitInfo.sha;
            logger.info({ from: baseSha.substring(0, 7), to: currentSha.substring(0, 7) }, 'computing git diff');

            let diffOutput: string;
            try {
                diffOutput = execSync(
                    `git diff --name-only --diff-filter=ACMR ${baseSha}..${currentSha}`,
                    { cwd: path.resolve(targetPath), encoding: 'utf-8' },
                ).trim();
            } catch {
                logger.warn('git diff failed — the base SHA may no longer exist');
                await graph.disconnect();
                return;
            }

            if (!diffOutput) {
                logger.info('No files changed since last scan');
                await graph.disconnect();
                return;
            }

            const changedPaths = diffOutput
                .split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0)
                .map(f => path.resolve(targetPath, f))
                .filter(f => fs.existsSync(f));

            // Filter to supported extensions
            const supportedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.md', '.sql', '.cs', '.yml', '.yaml', '.tf', '.tfvars', '.graphql', '.gql', '.env', '.json']);
            const excludePatterns = ['node_modules', 'dist', 'build', '.next', '.nuxt', 'coverage', '__pycache__', 'target', '.venv'];
            const filesToScan = changedPaths.filter(f => {
                const ext = path.extname(f).toLowerCase();
                if (!supportedExts.has(ext)) return false;
                const normalized = f.replace(/\\/g, '/');
                return !excludePatterns.some(p => normalized.includes(`/${p}/`));
            });

            logger.info({ total: changedPaths.length, supported: filesToScan.length }, 'changed files discovered');

            if (filesToScan.length === 0) {
                logger.info('No supported files changed');
                await graph.disconnect();
                return;
            }

            // Parse only changed files
            const parser = createParserEngine();
            const results = await parser.parseFiles(filesToScan);

            const totalNodes = results.reduce((sum, r) => sum + r.nodes.length, 0);
            const totalEdges = results.reduce((sum, r) => sum + r.edges.length, 0);
            logger.info({ files: results.length, nodes: totalNodes, edges: totalEdges }, 'incremental parse complete');

            // Ingest only changed files
            await graph.ingestBatch(results, projectId);

            // Get deleted files and purge them
            let deletedOutput = '';
            try {
                deletedOutput = execSync(
                    `git diff --name-only --diff-filter=D ${baseSha}..${currentSha}`,
                    { cwd: path.resolve(targetPath), encoding: 'utf-8' },
                ).trim();
            } catch {
                // ignore
            }

            if (deletedOutput) {
                const deletedPaths = deletedOutput.split('\n').map(f => f.trim()).filter(f => f.length > 0);
                if (deletedPaths.length > 0) {
                    logger.info({ count: deletedPaths.length }, 'purging deleted files from graph');
                    for (const dp of deletedPaths) {
                        const absPath = path.resolve(targetPath, dp);
                        await graph.executeQuery(
                            `MATCH (f:File) WHERE f.path = $path DETACH DELETE f`,
                            { path: absPath },
                        );
                    }
                }
            }

            // Store scan metadata
            await graph.executeQuery(
                `MERGE (s:ScanMeta {sha: $sha, projectId: $projectId})
                 ON CREATE SET s.createdAt = datetime()
                 SET s.shortSha = $shortSha, s.message = $message, s.author = $author,
                     s.gitDate = $gitDate, s.scannedAt = datetime(), s.incremental = true,
                     s.fileCount = $fileCount, s.nodeCount = $nodeCount, s.edgeCount = $edgeCount`,
                {
                    sha: currentSha, projectId,
                    shortSha: gitInfo.shortSha, message: gitInfo.message,
                    author: gitInfo.author, gitDate: gitInfo.date,
                    fileCount: results.length, nodeCount: totalNodes, edgeCount: totalEdges,
                },
            );

            const stats = await graph.getStats(projectId);
            logger.info({
                mode: 'incremental',
                scanned: filesToScan.length,
                nodes: stats.nodeCount,
                edges: stats.edgeCount,
                files: stats.fileCount,
            }, 'incremental sync complete');

        } catch (err) {
            if (err instanceof Error && err.message.includes('connect')) {
                logger.error('Cannot connect to Neo4j. Is it running?');
            } else {
                logger.error({ err }, 'Incremental scan failed');
            }
        } finally {
            await graph.disconnect();
        }
    });
