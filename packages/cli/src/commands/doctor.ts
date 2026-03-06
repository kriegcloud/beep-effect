import { Command } from 'commander';
import { loadConfigFromEnv } from '@nomik/core';
import { createGraphService } from '@nomik/graph';
import { readProjectConfig } from '../utils/project-config.js';
import { loadRulesConfig } from '../utils/rules-config.js';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

interface CheckResult {
    name: string;
    status: 'ok' | 'warn' | 'fail';
    message: string;
    detail?: string;
}

export const doctorCommand = new Command('doctor')
    .description('Diagnose NOMIK installation: Neo4j, MCP, config, dependencies')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
        const checks: CheckResult[] = [];

        // 1. Node.js version
        const nodeVersion = process.version;
        const major = Number(nodeVersion.slice(1).split('.')[0]);
        checks.push({
            name: 'Node.js version',
            status: major >= 20 ? 'ok' : major >= 18 ? 'warn' : 'fail',
            message: nodeVersion,
            detail: major < 20 ? 'NOMIK requires Node.js >= 20' : undefined,
        });

        // 2. pnpm available
        try {
            const pnpmVersion = execSync('pnpm --version 2>&1', { encoding: 'utf-8' }).trim();
            checks.push({ name: 'pnpm', status: 'ok', message: `v${pnpmVersion}` });
        } catch {
            checks.push({ name: 'pnpm', status: 'warn', message: 'Not found', detail: 'pnpm is recommended but not required' });
        }

        // 3. Neo4j connection
        const envConfig = loadConfigFromEnv();
        const graphUri = envConfig.graph?.uri ?? 'bolt://localhost:7687';
        checks.push({ name: 'Neo4j URI', status: 'ok', message: graphUri });

        try {
            const graph = createGraphService(envConfig.graph ?? { driver: 'neo4j' as const, uri: graphUri, auth: { username: 'neo4j', password: 'nomikpass' }, maxConnectionPoolSize: 50, connectionTimeoutMs: 5000 });
            await graph.connect();
            const healthy = await graph.healthCheck();
            if (healthy) {
                const stats = await graph.getStats();
                checks.push({
                    name: 'Neo4j connection',
                    status: 'ok',
                    message: `Connected — ${stats.nodeCount} nodes, ${stats.edgeCount} edges`,
                });
            } else {
                checks.push({ name: 'Neo4j connection', status: 'fail', message: 'Health check failed' });
            }
            await graph.disconnect();
        } catch (err) {
            checks.push({
                name: 'Neo4j connection',
                status: 'fail',
                message: 'Cannot connect',
                detail: err instanceof Error ? err.message : String(err),
            });
        }

        // 4. Project config
        const local = readProjectConfig();
        if (local) {
            checks.push({ name: '.nomik/project.json', status: 'ok', message: `Project: ${local.projectName} (${local.projectId})` });
        } else {
            checks.push({ name: '.nomik/project.json', status: 'warn', message: 'Not found', detail: 'Run `nomik init` to create a project config' });
        }

        // 5. Rules config
        const rulesConfig = loadRulesConfig();
        if (rulesConfig) {
            const keyCount = Object.keys(rulesConfig).length;
            checks.push({ name: '.nomik/rules.yaml', status: 'ok', message: `${keyCount} rules configured` });
        } else {
            checks.push({ name: '.nomik/rules.yaml', status: 'warn', message: 'Not found', detail: 'Run `nomik rules --init` to create a default config' });
        }

        // 6. MCP server binary
        const mcpServerPath = path.resolve('packages', 'mcp-server', 'dist', 'index.js');
        if (fs.existsSync(mcpServerPath)) {
            checks.push({ name: 'MCP server binary', status: 'ok', message: mcpServerPath });
        } else {
            // Try node_modules
            const altPath = path.resolve('node_modules', '@nomik', 'mcp-server', 'dist', 'index.js');
            if (fs.existsSync(altPath)) {
                checks.push({ name: 'MCP server binary', status: 'ok', message: altPath });
            } else {
                checks.push({ name: 'MCP server binary', status: 'warn', message: 'Not found', detail: 'Run `pnpm build` to build the MCP server' });
            }
        }

        // 7. Environment variables
        const envVars = ['NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD', 'NOMIK_PROJECT_ID', 'NOMIK_ROLE', 'NOMIK_SAMPLING'];
        const setVars = envVars.filter(v => process.env[v]);
        const unsetVars = envVars.filter(v => !process.env[v]);
        checks.push({
            name: 'Environment variables',
            status: 'ok',
            message: setVars.length > 0 ? `Set: ${setVars.join(', ')}` : 'Using defaults',
            detail: unsetVars.length > 0 ? `Not set (using defaults): ${unsetVars.join(', ')}` : undefined,
        });

        // 8. Git available
        try {
            const gitVersion = execSync('git --version 2>&1', { encoding: 'utf-8' }).trim();
            checks.push({ name: 'Git', status: 'ok', message: gitVersion });
        } catch {
            checks.push({ name: 'Git', status: 'warn', message: 'Not found', detail: 'Git is needed for scan:incremental and pr-impact' });
        }

        // 9. MCP client configs
        const mcpClients = [
            { name: 'Cursor', path: path.join(process.cwd(), '.cursor', 'mcp.json') },
            { name: 'Windsurf', path: path.join(process.cwd(), '.windsurf', 'mcp.json') },
        ];
        for (const client of mcpClients) {
            if (fs.existsSync(client.path)) {
                checks.push({ name: `${client.name} MCP config`, status: 'ok', message: client.path });
            }
        }

        // 10. Docker compose
        if (fs.existsSync('docker-compose.yml') || fs.existsSync('docker-compose.yaml')) {
            checks.push({ name: 'docker-compose.yml', status: 'ok', message: 'Found' });
        } else {
            checks.push({ name: 'docker-compose.yml', status: 'warn', message: 'Not found', detail: 'Neo4j can be started via docker-compose' });
        }

        // Output
        if (opts.json) {
            console.log(JSON.stringify({ checks, summary: summarize(checks) }, null, 2));
        } else {
            console.log('');
            console.log(`  \x1b[36m\x1b[1mNOMIK Doctor\x1b[0m`);
            console.log('');

            for (const c of checks) {
                const icon = c.status === 'ok' ? '\x1b[32m✓\x1b[0m' : c.status === 'warn' ? '\x1b[33m⚠\x1b[0m' : '\x1b[31m✗\x1b[0m';
                console.log(`  ${icon} \x1b[1m${c.name}\x1b[0m: ${c.message}`);
                if (c.detail) console.log(`    \x1b[90m${c.detail}\x1b[0m`);
            }

            const { ok, warn, fail } = summarize(checks);
            console.log('');
            console.log(`  \x1b[32m${ok} ok\x1b[0m  \x1b[33m${warn} warnings\x1b[0m  \x1b[31m${fail} failures\x1b[0m`);

            if (fail > 0) {
                console.log(`\n  \x1b[31mFix the failures above before using NOMIK.\x1b[0m\n`);
            } else if (warn > 0) {
                console.log(`\n  \x1b[33mNOMIK is functional but some optional features may be missing.\x1b[0m\n`);
            } else {
                console.log(`\n  \x1b[32mEverything looks good!\x1b[0m\n`);
            }
        }
    });

function summarize(checks: CheckResult[]) {
    return {
        ok: checks.filter(c => c.status === 'ok').length,
        warn: checks.filter(c => c.status === 'warn').length,
        fail: checks.filter(c => c.status === 'fail').length,
    };
}
