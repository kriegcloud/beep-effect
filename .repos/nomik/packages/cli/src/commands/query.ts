import { Command } from 'commander';
import { loadConfigFromEnv, createLogger, setLogger } from '@nomik/core';
import { createGraphService } from '@nomik/graph';

/** CLI command to execute raw Cypher queries */
export const queryCommand = new Command('query')
    .description('Execute a raw Cypher query against the knowledge graph')
    .argument('<cypher>', 'Cypher query string')
    .option('-j, --json', 'Output raw JSON')
    .action(async (cypher: string, opts: { json?: boolean }) => {
        const logger = createLogger({ level: 'info', pretty: true });
        setLogger(logger);
        const envConfig = loadConfigFromEnv();
        if (!envConfig.graph) {
            logger.error('Graph config missing. Set NOMIK_GRAPH_URI, NOMIK_GRAPH_USER, NOMIK_GRAPH_PASS env vars.');
            process.exit(1);
        }
        const graph = createGraphService(envConfig.graph);

        try {
            await graph.connect();
            const results = await graph.executeQuery<Record<string, unknown>>(cypher);

            /** Convertit une valeur Neo4j (Integer, array, etc.) en string lisible */
            const formatValue = (v: unknown): string => {
                if (v === null || v === undefined) return '';
                // Neo4j Integer — objet avec low/high
                if (typeof v === 'object' && v !== null && 'low' in v && 'high' in v) {
                    return String((v as { low: number }).low);
                }
                if (Array.isArray(v)) return v.map(formatValue).join(', ');
                if (typeof v === 'object') return JSON.stringify(v);
                return String(v);
            };

            if (opts.json) {
                console.log(JSON.stringify(results, null, 2));
            } else {
                if (results.length === 0) {
                    console.log('(no results)');
                    return;
                }
                const first = results[0]!;
                const keys = Object.keys(first);

                // Calcul dynamique de la largeur par colonne (min 10, max 80)
                const colWidths = keys.map(k => {
                    const headerLen = k.length;
                    const maxValLen = results.reduce((max, row) => {
                        const len = formatValue(row[k]).length;
                        return len > max ? len : max;
                    }, 0);
                    return Math.min(80, Math.max(10, headerLen, maxValLen));
                });

                console.log(keys.map((k, i) => k.padEnd(colWidths[i]!)).join(' | '));
                console.log(colWidths.map(w => '-'.repeat(w)).join('-+-'));
                for (const row of results) {
                    console.log(keys.map((k, i) => {
                        const s = formatValue(row[k]);
                        return s.length > colWidths[i]! ? s.substring(0, colWidths[i]! - 1) + '…' : s.padEnd(colWidths[i]!);
                    }).join(' | '));
                }
                console.log(`\n${results.length} row(s)`);
            }
        } catch (err) {
            logger.error({ error: err instanceof Error ? err.message : String(err) }, 'query failed');
            process.exit(1);
        } finally {
            await graph.disconnect();
        }
    });
