import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { Command } from 'commander';
import { readProjectConfig, writeProjectConfig, createProjectNode, defaultProjectName, PROJECT_CONFIG_VERSION } from '../utils/project-config.js';

const ENV_TEMPLATE = `# NOMIK — Environment Configuration
# All values below are defaults. Override as needed.

# Graph database
NOMIK_GRAPH_DRIVER=neo4j
NOMIK_GRAPH_URI=bolt://localhost:7687
NOMIK_GRAPH_USER=neo4j
NOMIK_GRAPH_PASS=nomik_local

# Logging
NOMIK_LOG_LEVEL=info

# Server ports
NOMIK_MCP_PORT=3334
NOMIK_VIZ_PORT=3333

# Project (auto-set by nomik init)
NOMIK_PROJECT_ID=

# MCP Sampling (set to true to enable AI sampling)
NOMIK_SAMPLING=false

# AI API Keys (optional — used by MCP sampling)
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
`;

const CONFIG_TEMPLATE = `import { defineConfig } from '@nomik/core';

export default defineConfig({
  target: {
    root: './src',
    include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.md', '**/*.py', '**/*.rs'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts', '**/__pycache__/**', '**/target/**', '**/.venv/**'],
  },
  // Graph connection reads from .env (NOMIK_GRAPH_URI, NOMIK_GRAPH_USER, NOMIK_GRAPH_PASS)
  parser: {
    languages: ['typescript', 'python', 'rust'],
  },
});
`;

const DOCKER_COMPOSE_TEMPLATE = `version: '3.8'
services:
  neo4j:
    image: neo4j:5.12-community
    container_name: nomik-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/nomik_local
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_memory_heap_max__size=512M
    volumes:
      - nomik-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider localhost:7474 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  nomik-data:
`;

/** Check if Docker is available */
function hasDocker(): boolean {
    try {
        execSync('docker --version', { stdio: 'pipe' });
        return true;
    } catch { return false; }
}

/** Check if the Neo4j container is already running */
function isNeo4jRunning(): boolean {
    try {
        const out = execSync('docker ps --filter name=nomik-neo4j --format "{{.Status}}"', { stdio: 'pipe' }).toString().trim();
        return out.length > 0;
    } catch { return false; }
}

export const initCommand = new Command('init')
    .description('Initialize NOMIK in the current project (config + Neo4j)')
    .option('--no-docker', 'Skip Docker/Neo4j setup')
    .action(async (opts: { docker: boolean }) => {
        console.log('');
        console.log('  \x1b[36m\x1b[1mNOMIK — Project Initialization\x1b[0m');
        console.log('');

        // 1. .env file
        const envPath = path.resolve('.env');
        if (fs.existsSync(envPath)) {
            console.log('  \x1b[32m\u2713\x1b[0m .env already exists');
        } else {
            fs.writeFileSync(envPath, ENV_TEMPLATE, 'utf-8');
            console.log('  \x1b[32m\u2713\x1b[0m Created .env with default NOMIK configuration');
        }

        // 2. Config file
        const configPath = path.resolve('nomik.config.ts');
        if (fs.existsSync(configPath)) {
            console.log('  \x1b[32m\u2713\x1b[0m nomik.config.ts already exists');
        } else {
            fs.writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8');
            console.log('  \x1b[32m\u2713\x1b[0m Created nomik.config.ts');
        }

        // 3. Docker Compose
        if (opts.docker) {
            if (!hasDocker()) {
                console.log('  \x1b[33m!\x1b[0m Docker not found. Install Docker Desktop to use Neo4j.');
                console.log('    https://docs.docker.com/get-docker/');
            } else if (isNeo4jRunning()) {
                console.log('  \x1b[32m\u2713\x1b[0m Neo4j container already running');
            } else {
                const composePath = path.resolve('docker-compose.yml');
                if (!fs.existsSync(composePath)) {
                    fs.writeFileSync(composePath, DOCKER_COMPOSE_TEMPLATE, 'utf-8');
                    console.log('  \x1b[32m\u2713\x1b[0m Created docker-compose.yml');
                }
                console.log('  \x1b[36m...\x1b[0m Starting Neo4j container...');
                try {
                    execSync('docker compose up -d', { stdio: 'pipe', cwd: process.cwd() });
                    console.log('  \x1b[32m\u2713\x1b[0m Neo4j started (bolt://localhost:7687)');
                    console.log('  \x1b[2m  UI: http://localhost:7474  |  user: neo4j  |  pass: nomik_local\x1b[0m');
                } catch (err) {
                    console.log(`  \x1b[31m\u2717\x1b[0m Failed to start Neo4j: ${err instanceof Error ? err.message : err}`);
                }
            }
        } else {
            console.log('  \x1b[2m  Skipping Docker setup (--no-docker)\x1b[0m');
        }

        // 4. Auto-creation of local project (.nomik/project.json)
        const existing = readProjectConfig();
        if (existing) {
            console.log(`  \x1b[32m\u2713\x1b[0m Project already configured: ${existing.projectName} (${existing.projectId})`);
        } else {
            const name = defaultProjectName();
            const node = createProjectNode(name);
            writeProjectConfig({ version: PROJECT_CONFIG_VERSION, projectId: node.id, projectName: name, createdAt: new Date().toISOString() });

            // Update .env with the project ID
            if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf-8');
                envContent = envContent.replace(/^NOMIK_PROJECT_ID=.*$/m, `NOMIK_PROJECT_ID=${node.id}`);
                fs.writeFileSync(envPath, envContent, 'utf-8');
            }
            console.log(`  \x1b[32m\u2713\x1b[0m Project created: ${name} (${node.id})`);
            console.log('  \x1b[2m  .nomik/project.json written — commit this file to share with your team\x1b[0m');
        }

        // 5. .gitignore check
        const gitignorePath = path.resolve('.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf-8');
            if (!content.includes('docker/data')) {
                fs.appendFileSync(gitignorePath, '\n# NOMIK\ndocker/data/\ndocker/logs/\n');
                console.log('  \x1b[32m\u2713\x1b[0m Updated .gitignore');
            }
        }

        console.log('');
        console.log('  \x1b[1mNext steps:\x1b[0m');
        console.log('    1. \x1b[33mnomik scan .\x1b[0m          Scan your codebase');
        console.log('    2. \x1b[33mnomik setup-cursor\x1b[0m    Configure Cursor AI');
        console.log('       \x1b[33mnomik setup-windsurf\x1b[0m  Configure Windsurf AI');
        console.log('    3. \x1b[33mnomik watch .\x1b[0m         Keep graph updated live');
        console.log('');
    });
