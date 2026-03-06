import type { GraphNode, GraphEdge, MetricNode } from '@nomik/core';
import { createNodeId } from '../utils.js';

// ────────────────────────────────────────────────────────────────────────
// Infrastructure Config Detection
//
// Detects:
//   - prometheus.yml: scrape_configs, alerting rules
//   - Alert rules (*.rules.yml): alert name, expr (PromQL), labels
//   - Grafana dashboards (*.json): panel titles, datasource, PromQL targets
//
// Creates: MetricNode (from PromQL references) + links to existing metrics
// ────────────────────────────────────────────────────────────────────────

export interface AlertRuleInfo {
    alertName: string;
    expr: string;
    severity?: string;
    metricNames: string[];
    line: number;
}

export interface GrafanaPanelInfo {
    panelTitle: string;
    metricNames: string[];
    datasource?: string;
}

export function extractAlertRules(content: string, _filePath: string): AlertRuleInfo[] {
    const rules: AlertRuleInfo[] = [];

    // Match alert blocks: - alert: <name>\n  expr: <promql>
    const alertPattern = /^\s*-\s*alert:\s*(.+)$/gm;
    let match: RegExpExecArray | null;

    while ((match = alertPattern.exec(content)) !== null) {
        const alertName = (match[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
        const startIdx = match.index + match[0].length;
        const restOfBlock = content.slice(startIdx, startIdx + 500);

        // Extract expr
        const exprMatch = restOfBlock.match(/^\s*expr:\s*(.+)$/m);
        const expr = exprMatch?.[1]?.trim().replace(/^\|[-+>]?\s*/, '') ?? '';

        // Extract severity from labels
        const severityMatch = restOfBlock.match(/severity:\s*(\w+)/);
        const severity = severityMatch?.[1] ?? undefined;

        // Extract metric names from PromQL expression
        const metricNames = extractMetricNamesFromPromQL(expr);

        const lineNumber = content.slice(0, match.index).split('\n').length;
        rules.push({ alertName, expr, severity, metricNames, line: lineNumber });
    }

    return rules;
}

export function extractGrafanaPanels(content: string, _filePath: string): GrafanaPanelInfo[] {
    const panels: GrafanaPanelInfo[] = [];

    try {
        const dashboard = JSON.parse(content);
        if (!dashboard.panels && !dashboard.rows) return panels;

        const allPanels = dashboard.panels ?? [];
        // Legacy Grafana: panels inside rows
        if (dashboard.rows) {
            for (const row of dashboard.rows) {
                if (row.panels) allPanels.push(...row.panels);
            }
        }

        for (const panel of allPanels) {
            if (!panel.title) continue;
            const metricNames: string[] = [];
            const targets = panel.targets ?? [];
            for (const target of targets) {
                const expr = target.expr ?? target.query ?? '';
                if (expr) {
                    metricNames.push(...extractMetricNamesFromPromQL(expr));
                }
            }
            if (metricNames.length > 0) {
                panels.push({
                    panelTitle: panel.title,
                    metricNames: [...new Set(metricNames)],
                    datasource: typeof panel.datasource === 'string' ? panel.datasource : panel.datasource?.type,
                });
            }
        }
    } catch {
        // Invalid JSON — skip
    }

    return panels;
}

export interface ScrapeConfigInfo {
    jobName: string;
    metricsPath?: string;
    targets: string[];
}

export function extractScrapeConfigs(content: string): ScrapeConfigInfo[] {
    const configs: ScrapeConfigInfo[] = [];

    // Match scrape_configs job blocks: - job_name: '<name>'
    const jobPattern = /^\s*-\s*job_name:\s*['"]?([^'"}\n]+)['"]?/gm;
    let match: RegExpExecArray | null;

    while ((match = jobPattern.exec(content)) !== null) {
        const jobName = (match[1] ?? '').trim();
        const startIdx = match.index + match[0].length;
        const block = content.slice(startIdx, startIdx + 300);

        const pathMatch = block.match(/metrics_path:\s*['"]?([^'"\n]+)['"]?/);
        const metricsPath = pathMatch?.[1]?.trim() ?? undefined;

        const targets: string[] = [];
        const targetPattern = /['"]([^'"]+:\d+)['"]/g;
        let tMatch: RegExpExecArray | null;
        while ((tMatch = targetPattern.exec(block)) !== null) {
            if (tMatch[1]) targets.push(tMatch[1]);
        }

        configs.push({ jobName, metricsPath, targets });
    }

    return configs;
}

function extractMetricNamesFromPromQL(expr: string): string[] {
    const names: string[] = [];
    // PromQL metric names: [a-zA-Z_:][a-zA-Z0-9_:]* followed by { or ( or space
    // Exclude PromQL functions/keywords
    const PROMQL_FUNCS = new Set([
        'rate', 'irate', 'increase', 'sum', 'avg', 'min', 'max', 'count',
        'histogram_quantile', 'quantile', 'topk', 'bottomk', 'sort', 'sort_desc',
        'abs', 'absent', 'ceil', 'floor', 'round', 'clamp', 'clamp_min', 'clamp_max',
        'delta', 'deriv', 'exp', 'ln', 'log2', 'log10', 'sqrt',
        'label_replace', 'label_join', 'vector', 'scalar', 'time',
        'by', 'without', 'on', 'ignoring', 'group_left', 'group_right',
        'and', 'or', 'unless', 'offset', 'bool',
    ]);

    const metricPattern = /\b([a-zA-Z_:][a-zA-Z0-9_:]*)\s*[{(]/g;
    let match: RegExpExecArray | null;
    while ((match = metricPattern.exec(expr)) !== null) {
        const name = match[1];
        if (name && !PROMQL_FUNCS.has(name.toLowerCase()) && !name.startsWith('__')) {
            names.push(name);
        }
    }

    // Also match bare metric names (no braces/parens)
    const barePattern = /\b([a-zA-Z_][a-zA-Z0-9_:]{3,})\b/g;
    while ((match = barePattern.exec(expr)) !== null) {
        const name = match[1];
        if (name && !PROMQL_FUNCS.has(name.toLowerCase()) && !name.startsWith('__') && !names.includes(name)) {
            names.push(name);
        }
    }

    return [...new Set(names)];
}

export function buildInfraConfigNodes(
    alerts: AlertRuleInfo[],
    panels: GrafanaPanelInfo[],
    filePath: string,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [];
    const seenNodes = new Set<string>();

    // Alerts reference metrics → create MetricNode stubs if not already known
    for (const alert of alerts) {
        for (const metricName of alert.metricNames) {
            const nodeId = createNodeId('metric', filePath, metricName);
            if (!seenNodes.has(nodeId)) {
                seenNodes.add(nodeId);
                const metricNode: MetricNode = {
                    id: nodeId,
                    type: 'metric',
                    name: metricName,
                    metricType: 'unknown',
                    help: `Referenced in alert: ${alert.alertName}`,
                    filePath,
                };
                nodes.push(metricNode);
            }
        }
    }

    // Grafana panels reference metrics → create MetricNode stubs
    for (const panel of panels) {
        for (const metricName of panel.metricNames) {
            const nodeId = createNodeId('metric', filePath, metricName);
            if (!seenNodes.has(nodeId)) {
                seenNodes.add(nodeId);
                const metricNode: MetricNode = {
                    id: nodeId,
                    type: 'metric',
                    name: metricName,
                    metricType: 'unknown',
                    help: `Referenced in Grafana panel: ${panel.panelTitle}`,
                    filePath,
                };
                nodes.push(metricNode);
            }
        }
    }

    return { nodes, edges: [] };
}
