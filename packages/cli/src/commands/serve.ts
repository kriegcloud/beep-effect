import { Command } from 'commander';
import { createLogger, setLogger } from '@nomik/core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** serve command: start the MCP server and optionally the viz dashboard */
export const serveCommand = new Command('serve')
    .description('Start MCP server and visualization dashboard')
    .option('--no-viz', 'Skip visualization dashboard')
    .option('--viz-port <port>', 'Visualization port', '3000')
    .action(async (opts: { viz: boolean; vizPort: string }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);

        const cliDistDir = path.dirname(fileURLToPath(import.meta.url));
        const rootDir = path.resolve(cliDistDir, '..', '..', '..');

        logger.info('Starting MCP server (stdio mode)...');
        const mcpPath = path.join(rootDir, 'packages', 'mcp-server', 'dist', 'index.js');
        logger.info({ path: mcpPath }, 'MCP server ready for stdio connections');

        if (opts.viz) {
            logger.info({ port: opts.vizPort }, 'Starting visualization dashboard...');
            const vizDir = path.join(rootDir, 'packages', 'viz');
            const viteCandidates = [
                path.join(vizDir, 'node_modules', 'vite', 'bin', 'vite.js'),
                path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js'),
            ];
            const viteBin = viteCandidates.find((p) => fs.existsSync(p)) ?? null;
            if (!viteBin) {
                logger.error('Cannot resolve Vite binary. Install dependencies first or run with --no-viz.');
                return;
            }
            let vizProcess;
            try {
                vizProcess = spawn(process.execPath, [viteBin, '--port', opts.vizPort], {
                    cwd: vizDir,
                    stdio: 'inherit',
                });
            } catch (err) {
                logger.error({ error: err instanceof Error ? err.message : String(err) }, 'Failed to start viz process');
                logger.info('Use --no-viz to run MCP-only mode.');
                return;
            }

            vizProcess.on('error', (err) => {
                logger.error({ error: err.message }, 'Viz process error');
            });

            process.on('SIGINT', () => {
                vizProcess.kill();
                process.exit(0);
            });
        } else {
            logger.info('Viz disabled. Use --viz to enable.');
            logger.info('Use `nomik setup-cursor` or `nomik setup-windsurf` to configure IDE MCP files.');
        }
    });
