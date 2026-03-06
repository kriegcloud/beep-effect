import { Command } from 'commander';
import { createLogger, loadConfigFromEnv, validateConfig } from '@nomik/core';
import { createParserEngine, discoverFiles, getGitInfo } from '@nomik/parser';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig, writeProjectConfig, createProjectNode, defaultProjectName, PROJECT_CONFIG_VERSION } from '../utils/project-config.js';

export const scanCommand = new Command('scan')
    .description('Parse and index a codebase into the NOMIK knowledge graph')
    .argument('<path>', 'Path to the project root')
    .option('--language <lang>', 'Language to parse', 'typescript')
    .option('--project <name>', 'Project name (auto-detected from directory if not set)')
    .action(async (targetPath: string, opts: { language: string; project?: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        const envConfig = loadConfigFromEnv();
        const config = validateConfig({
            ...envConfig,
            target: {
                root: targetPath,
                include: [
                    '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.md', '**/*.py', '**/*.rs', '**/*.sql', '**/*.cs',
                    '**/*.yml', '**/*.yaml', '**/*.tf', '**/*.tfvars', '**/*.graphql', '**/*.gql',
                    '**/Dockerfile', '**/Dockerfile.*', '**/.env', '**/.env.*',
                    '**/package.json', '**/requirements.txt',
                ],
                exclude: [
                    '**/node_modules/**', '**/dist/**', '**/build/**', '**/out/**',
                    '**/.next/**', '**/.nuxt/**', '**/.svelte-kit/**', '**/coverage/**',
                    '**/public/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts',
                    '**/__pycache__/**', '**/target/**', '**/.venv/**', '**/venv/**',
                    '**/*.min.js', '**/*.min.css', '**/*.bundle.js',
                    '**/pnpm-lock.yaml', '**/yarn.lock', '**/package-lock.json',
                    '**/wiki/**',
                ],
            },
        });

        const gitInfo = getGitInfo();

        // Project resolution: local config > CLI option > auto-creation
        let localConfig = readProjectConfig();
        let projectId: string;

        if (opts.project) {
            // Explicit CLI option
            const node = createProjectNode(opts.project);
            projectId = node.id;
        } else if (localConfig) {
            projectId = localConfig.projectId;
        } else {
            // Auto-create from directory name
            const name = defaultProjectName();
            const node = createProjectNode(name);
            projectId = node.id;
            writeProjectConfig({ version: PROJECT_CONFIG_VERSION, projectId: node.id, projectName: name, createdAt: new Date().toISOString() });
            logger.info({ project: name, id: projectId }, 'auto-created project from directory name');
        }

        logger.info({ path: targetPath, project: projectId, gitSha: gitInfo?.shortSha ?? 'n/a' }, 'NOMIK — Scanning target');

        const files = await discoverFiles(config.target);
        logger.info({ count: files.length }, 'Files discovered');

        if (files.length === 0) {
            logger.warn('No supported files found');
            return;
        }

        const parser = createParserEngine();
        const results = await parser.parseFiles(files);

        const totalNodes = results.reduce((sum, r) => sum + r.nodes.length, 0);
        const totalEdges = results.reduce((sum, r) => sum + r.edges.length, 0);
        logger.info({
            files: results.length,
            nodes: totalNodes,
            edges: totalEdges
        }, 'Parsing complete');

        const graph = createGraphService(config.graph);

        try {
            await graph.connect();
            await graph.initSchema();

            // Creer le projet dans Neo4j s'il n'existe pas, ou mettre a jour rootPath si le dossier a ete renomme
            const existing = await graph.getProject(projectId);
            if (!existing) {
                const projNode = createProjectNode(localConfig?.projectName ?? defaultProjectName());
                await graph.createProject(projNode);
            } else if (existing.rootPath !== process.cwd()) {
                await graph.executeQuery(
                    'MATCH (p:Project {id: $id}) SET p.rootPath = $rootPath, p.updatedAt = datetime()',
                    { id: projectId, rootPath: process.cwd() },
                );
                logger.info({ old: existing.rootPath, new: process.cwd() }, 'project rootPath updated (folder rename detected)');
            }

            // 3-phase ingestion: preserves cross-file edges (DEPENDS_ON, CALLS)
            await graph.ingestBatch(results, projectId);

            // Store scan metadata (git SHA, timestamp) with projectId
            if (gitInfo) {
                await graph.executeQuery(
                    `MERGE (s:ScanMeta {sha: $sha, projectId: $projectId})
                     ON CREATE SET s.createdAt = datetime()
                     SET s.shortSha = $shortSha, s.message = $message, s.author = $author,
                         s.gitDate = $gitDate, s.scannedAt = datetime(),
                         s.fileCount = $fileCount, s.nodeCount = $nodeCount, s.edgeCount = $edgeCount`,
                    {
                        sha: gitInfo.sha,
                        projectId,
                        shortSha: gitInfo.shortSha,
                        message: gitInfo.message,
                        author: gitInfo.author,
                        gitDate: gitInfo.date,
                        fileCount: results.length,
                        nodeCount: results.reduce((s, r) => s + r.nodes.length, 0),
                        edgeCount: results.reduce((s, r) => s + r.edges.length, 0),
                    },
                );
                logger.info({ gitSha: gitInfo.shortSha, message: gitInfo.message }, 'scan tagged with git commit');
            }

            const stats = await graph.getStats(projectId);
            logger.info({
                project: projectId,
                nodes: stats.nodeCount,
                edges: stats.edgeCount,
                files: stats.fileCount,
                functions: stats.functionCount,
                classes: stats.classCount,
                routes: stats.routeCount
            }, 'Graph sync complete');

        } catch (err) {
            if (err instanceof Error && err.message.includes('connect')) {
                logger.error('Cannot connect to Neo4j. Is it running? (Run "nomik init" or "docker compose up -d")');
            } else {
                logger.error({ err }, 'Scan failed');
            }
        } finally {
            await graph.disconnect();
        }
    });
