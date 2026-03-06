export const graphStyles: any[] = [
    {
        selector: 'node',
        style: {
            'background-color': '#1e293b',
            'label': 'data(name)',
            'color': '#cbd5e1',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'font-size': '12px',
            'font-family': 'monospace',
            'width': 20,
            'height': 20,
            'border-width': 1,
            'border-color': '#475569',
            'overlay-padding': '4px',
            'overlay-opacity': 0,
            'z-index': 10,
            'text-background-color': '#020617',
            'text-background-opacity': 0.7,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle'
        }
    },
    // FILE: visual anchors of the graph
    {
        selector: 'node[label="File"]',
        style: {
            'background-color': '#083344',
            'border-color': 'data(dirColor)',
            'border-width': 3,
            'color': '#22d3ee',
            'shape': 'round-rectangle',
            'width': 50,
            'height': 32,
            'padding': '12px',
            'font-size': '14px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-margin-y': 0,
            'z-index': 20
        }
    },
    // FUNCTION: detail nodes
    {
        selector: 'node[label="Function"]',
        style: {
            'background-color': '#064e3b',
            'border-color': 'data(dirColor)',
            'border-width': 1.5,
            'color': '#86efac',
            'width': 12,
            'height': 12,
            'font-size': '10px'
        }
    },
    // CLASS: marker nodes
    {
        selector: 'node[label="Class"]',
        style: {
            'background-color': '#3b0764',
            'border-color': 'data(dirColor)',
            'border-width': 2,
            'color': '#d8b4fe',
            'shape': 'diamond',
            'width': 24,
            'height': 24,
            'font-size': '12px',
            'font-weight': 'bold'
        }
    },
    // ROUTE: API endpoints
    {
        selector: 'node[label="Route"]',
        style: {
            'background-color': '#78350f',
            'border-color': '#f59e0b',
            'border-width': 2,
            'color': '#fbbf24',
            'shape': 'hexagon',
            'width': 22,
            'height': 22,
            'font-size': '11px',
            'font-weight': 'bold'
        }
    },
    // VARIABLE: module-level variables
    {
        selector: 'node[label="Variable"]',
        style: {
            'background-color': '#1e3a5f',
            'border-color': '#60a5fa',
            'border-width': 1,
            'color': '#93c5fd',
            'shape': 'round-tag',
            'width': 10,
            'height': 10,
            'font-size': '9px'
        }
    },
    // EVENT: event listeners/emitters
    {
        selector: 'node[label="Event"]',
        style: {
            'background-color': '#4a1d96',
            'border-color': '#c084fc',
            'border-width': 1.5,
            'color': '#d8b4fe',
            'shape': 'star',
            'width': 18,
            'height': 18,
            'font-size': '10px'
        }
    },
    // ENV_VAR: environment variables
    {
        selector: 'node[label="EnvVar"]',
        style: {
            'background-color': '#3f3f46',
            'border-color': '#a1a1aa',
            'border-width': 1,
            'color': '#d4d4d8',
            'shape': 'round-rectangle',
            'width': 14,
            'height': 10,
            'font-size': '9px'
        }
    },
    // MODULE: logical grouping
    {
        selector: 'node[label="Module"]',
        style: {
            'background-color': '#164e63',
            'border-color': '#22d3ee',
            'border-width': 1,
            'color': '#67e8f9',
            'shape': 'round-rectangle',
            'width': 16,
            'height': 12,
            'font-size': '9px'
        }
    },
    // DB_TABLE: database tables
    {
        selector: 'node[label="DBTable"]',
        style: {
            'background-color': '#7c2d12',
            'border-color': '#fb923c',
            'border-width': 2,
            'color': '#fdba74',
            'shape': 'barrel',
            'width': 28,
            'height': 22,
            'font-size': '11px',
            'font-weight': 'bold'
        }
    },
    // DB_COLUMN: database columns
    {
        selector: 'node[label="DBColumn"]',
        style: {
            'background-color': '#7c2d12',
            'border-color': '#f97316',
            'border-width': 1,
            'color': '#fed7aa',
            'width': 8,
            'height': 8,
            'font-size': '8px'
        }
    },
    // EXTERNAL_API: external API calls
    {
        selector: 'node[label="ExternalAPI"]',
        style: {
            'background-color': '#1e1b4b',
            'border-color': '#818cf8',
            'border-width': 2,
            'color': '#a5b4fc',
            'shape': 'pentagon',
            'width': 22,
            'height': 22,
            'font-size': '10px',
            'font-weight': 'bold'
        }
    },
    // CRON_JOB: scheduled jobs
    {
        selector: 'node[label="CronJob"]',
        style: {
            'background-color': '#365314',
            'border-color': '#a3e635',
            'border-width': 1.5,
            'color': '#bef264',
            'shape': 'octagon',
            'width': 18,
            'height': 18,
            'font-size': '10px'
        }
    },
    // QUEUE_JOB: queue consumers/producers
    {
        selector: 'node[label="QueueJob"]',
        style: {
            'background-color': '#4a1d96',
            'border-color': '#e879f9',
            'border-width': 1.5,
            'color': '#f0abfc',
            'shape': 'rhomboid',
            'width': 18,
            'height': 14,
            'font-size': '10px'
        }
    },
    // METRIC: observability metrics
    {
        selector: 'node[label="Metric"]',
        style: {
            'background-color': '#134e4a',
            'border-color': '#2dd4bf',
            'border-width': 1,
            'color': '#5eead4',
            'shape': 'triangle',
            'width': 12,
            'height': 12,
            'font-size': '9px'
        }
    },
    // SPAN: tracing spans
    {
        selector: 'node[label="Span"]',
        style: {
            'background-color': '#083344',
            'border-color': '#38bdf8',
            'border-width': 1,
            'color': '#7dd3fc',
            'shape': 'round-rectangle',
            'width': 14,
            'height': 8,
            'font-size': '9px'
        }
    },
    // TOPIC: message topics
    {
        selector: 'node[label="Topic"]',
        style: {
            'background-color': '#4c1d95',
            'border-color': '#a78bfa',
            'border-width': 1.5,
            'color': '#c4b5fd',
            'shape': 'concave-hexagon',
            'width': 20,
            'height': 16,
            'font-size': '10px'
        }
    },
    // SECURITY_ISSUE: flagged security problems
    {
        selector: 'node[label="SecurityIssue"]',
        style: {
            'background-color': '#7f1d1d',
            'border-color': '#ef4444',
            'border-width': 3,
            'color': '#fca5a5',
            'shape': 'vee',
            'width': 20,
            'height': 20,
            'font-size': '10px',
            'font-weight': 'bold'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            'opacity': 0.55,
        }
    },
    // CALLS: edges amber/orange — highly visible
    {
        selector: 'edge[label="CALLS"]',
        style: {
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            'line-style': 'solid',
            'opacity': 0.8,
            'width': 2,
        }
    },
    // DEPENDS_ON: edges sky dashed (inter-file imports)
    {
        selector: 'edge[label="DEPENDS_ON"]',
        style: {
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'line-style': 'dashed',
            'opacity': 0.75,
            'width': 2,
        }
    },
    // IMPORTS: file-to-file import edges
    {
        selector: 'edge[label="IMPORTS"]',
        style: {
            'line-color': '#6366f1',
            'target-arrow-color': '#6366f1',
            'line-style': 'dashed',
            'opacity': 0.5,
            'width': 1.5,
        }
    },
    // EXPORTS: module exports
    {
        selector: 'edge[label="EXPORTS"]',
        style: {
            'line-color': '#8b5cf6',
            'target-arrow-color': '#8b5cf6',
            'line-style': 'dotted',
            'opacity': 0.4,
            'width': 1,
        }
    },
    // LISTENS_TO: event listener connections
    {
        selector: 'edge[label="LISTENS_TO"]',
        style: {
            'line-color': '#c084fc',
            'target-arrow-color': '#c084fc',
            'line-style': 'solid',
            'opacity': 0.7,
            'width': 2,
        }
    },
    // EXTENDS: class inheritance
    {
        selector: 'edge[label="EXTENDS"]',
        style: {
            'line-color': '#a855f7',
            'target-arrow-color': '#a855f7',
            'target-arrow-shape': 'triangle-backcurve',
            'line-style': 'solid',
            'opacity': 0.8,
            'width': 2.5,
        }
    },
    // USES_ENV: references to environment variables
    {
        selector: 'edge[label="USES_ENV"]',
        style: {
            'line-color': '#a1a1aa',
            'target-arrow-color': '#a1a1aa',
            'line-style': 'dotted',
            'opacity': 0.5,
            'width': 1,
        }
    },
    // HAS_SECURITY_ISSUE: security problem edges
    {
        selector: 'edge[label="HAS_SECURITY_ISSUE"]',
        style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'line-style': 'solid',
            'opacity': 0.9,
            'width': 3,
        }
    },
    // CALLS_EXTERNAL: external API call edges
    {
        selector: 'edge[label="CALLS_EXTERNAL"]',
        style: {
            'line-color': '#818cf8',
            'target-arrow-color': '#818cf8',
            'line-style': 'solid',
            'opacity': 0.7,
            'width': 2,
        }
    },
    // Selection
    {
        selector: 'node:selected',
        style: {
            'border-width': 4,
            'border-color': '#fff',
            'overlay-color': '#fff',
            'overlay-opacity': 0.15,
            'overlay-padding': 6,
            'z-index': 999
        }
    },
    {
        selector: 'edge:selected',
        style: {
            'line-color': '#fff',
            'target-arrow-color': '#fff',
            'width': 4,
            'opacity': 1,
            'z-index': 999
        }
    },
    // Impact: source (red)
    {
        selector: 'node.impact-source',
        style: {
            'border-color': '#ef4444',
            'border-width': 5,
            'overlay-color': '#ef4444',
            'overlay-opacity': 0.2,
            'overlay-padding': 8,
            'z-index': 1000,
        }
    },
    // Impact: callees downstream (amber)
    {
        selector: 'node.impact-callee',
        style: {
            'border-color': '#f59e0b',
            'border-width': 3,
            'overlay-color': '#f59e0b',
            'overlay-opacity': 0.15,
            'overlay-padding': 6,
            'z-index': 900,
        }
    },
    // Impact: callers upstream (blue)
    {
        selector: 'node.impact-caller',
        style: {
            'border-color': '#3b82f6',
            'border-width': 3,
            'overlay-color': '#3b82f6',
            'overlay-opacity': 0.15,
            'overlay-padding': 6,
            'z-index': 900,
        }
    },
    {
        selector: 'edge.impact-edge',
        style: {
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'width': 3,
            'opacity': 1,
            'z-index': 900,
        }
    },
    // Faded nodes when impact is active
    {
        selector: 'node.faded',
        style: {
            'opacity': 0.15,
        }
    },
    {
        selector: 'edge.faded',
        style: {
            'opacity': 0.05,
        }
    },
    // Search: highlight cyan
    {
        selector: 'node.search-match',
        style: {
            'border-color': '#22d3ee',
            'border-width': 4,
            'overlay-color': '#22d3ee',
            'overlay-opacity': 0.2,
            'overlay-padding': 6,
            'z-index': 1000,
        }
    },
    {
        selector: 'node.search-focus',
        style: {
            'border-color': '#f8fafc',
            'border-width': 5,
            'overlay-color': '#22d3ee',
            'overlay-opacity': 0.25,
            'overlay-padding': 8,
            'z-index': 1100,
        }
    },
    {
        selector: 'edge.search-edge',
        style: {
            'opacity': 0.9,
            'width': 2.5,
            'line-color': '#22d3ee',
            'target-arrow-color': '#22d3ee',
            'z-index': 950,
        }
    },
    // Filter visibility control
    {
        selector: '.filter-hidden',
        style: { 'display': 'none' }
    },
];

/** Performance-optimized styles for large graphs (>300 nodes) */
export const graphStylesFast: any[] = [
    {
        selector: 'node',
        style: {
            'background-color': '#1e293b',
            'label': 'data(name)',
            'color': '#cbd5e1',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            'font-size': '9px',
            'font-family': 'monospace',
            'width': 14,
            'height': 14,
            'border-width': 1,
            'border-color': '#475569',
            'overlay-padding': '2px',
            'overlay-opacity': 0,
            'min-zoomed-font-size': 10,  // Hide labels when zoomed out
        }
    },
    {
        selector: 'node[label="File"]',
        style: {
            'background-color': '#083344',
            'border-color': 'data(dirColor)',
            'border-width': 2,
            'color': '#22d3ee',
            'shape': 'round-rectangle',
            'width': 40,
            'height': 24,
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-margin-y': 0,
            'z-index': 20,
            'min-zoomed-font-size': 6,
        }
    },
    {
        selector: 'node[label="Function"]',
        style: {
            'background-color': '#064e3b',
            'border-color': 'data(dirColor)',
            'border-width': 1,
            'color': '#86efac',
            'width': 8,
            'height': 8,
            'font-size': '8px',
            'min-zoomed-font-size': 14,  // Only show when zoomed in close
        }
    },
    {
        selector: 'node[label="Class"]',
        style: {
            'background-color': '#3b0764',
            'border-color': 'data(dirColor)',
            'border-width': 1.5,
            'color': '#d8b4fe',
            'shape': 'diamond',
            'width': 16,
            'height': 16,
            'font-size': '9px',
            'min-zoomed-font-size': 12,
        }
    },
    { selector: 'node[label="Route"]', style: { 'background-color': '#78350f', 'border-color': '#f59e0b', 'border-width': 1.5, 'color': '#fbbf24', 'shape': 'hexagon', 'width': 16, 'height': 16, 'font-size': '9px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="Variable"]', style: { 'background-color': '#1e3a5f', 'border-color': '#60a5fa', 'border-width': 1, 'color': '#93c5fd', 'shape': 'round-tag', 'width': 7, 'height': 7, 'font-size': '7px', 'min-zoomed-font-size': 14 } },
    { selector: 'node[label="Event"]', style: { 'background-color': '#4a1d96', 'border-color': '#c084fc', 'border-width': 1, 'color': '#d8b4fe', 'shape': 'star', 'width': 12, 'height': 12, 'font-size': '8px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="EnvVar"]', style: { 'background-color': '#3f3f46', 'border-color': '#a1a1aa', 'border-width': 1, 'color': '#d4d4d8', 'shape': 'round-rectangle', 'width': 10, 'height': 7, 'font-size': '7px', 'min-zoomed-font-size': 14 } },
    { selector: 'node[label="Module"]', style: { 'background-color': '#164e63', 'border-color': '#22d3ee', 'border-width': 1, 'color': '#67e8f9', 'shape': 'round-rectangle', 'width': 12, 'height': 9, 'font-size': '8px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="DBTable"]', style: { 'background-color': '#7c2d12', 'border-color': '#fb923c', 'border-width': 1.5, 'color': '#fdba74', 'shape': 'barrel', 'width': 20, 'height': 16, 'font-size': '9px', 'min-zoomed-font-size': 10 } },
    { selector: 'node[label="DBColumn"]', style: { 'background-color': '#7c2d12', 'border-color': '#f97316', 'border-width': 1, 'color': '#fed7aa', 'width': 6, 'height': 6, 'font-size': '7px', 'min-zoomed-font-size': 14 } },
    { selector: 'node[label="ExternalAPI"]', style: { 'background-color': '#1e1b4b', 'border-color': '#818cf8', 'border-width': 1.5, 'color': '#a5b4fc', 'shape': 'pentagon', 'width': 16, 'height': 16, 'font-size': '9px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="CronJob"]', style: { 'background-color': '#365314', 'border-color': '#a3e635', 'border-width': 1, 'color': '#bef264', 'shape': 'octagon', 'width': 12, 'height': 12, 'font-size': '8px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="QueueJob"]', style: { 'background-color': '#4a1d96', 'border-color': '#e879f9', 'border-width': 1, 'color': '#f0abfc', 'shape': 'rhomboid', 'width': 12, 'height': 10, 'font-size': '8px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="Metric"]', style: { 'background-color': '#134e4a', 'border-color': '#2dd4bf', 'border-width': 1, 'color': '#5eead4', 'shape': 'triangle', 'width': 8, 'height': 8, 'font-size': '7px', 'min-zoomed-font-size': 14 } },
    { selector: 'node[label="Span"]', style: { 'background-color': '#083344', 'border-color': '#38bdf8', 'border-width': 1, 'color': '#7dd3fc', 'shape': 'round-rectangle', 'width': 10, 'height': 6, 'font-size': '7px', 'min-zoomed-font-size': 14 } },
    { selector: 'node[label="Topic"]', style: { 'background-color': '#4c1d95', 'border-color': '#a78bfa', 'border-width': 1, 'color': '#c4b5fd', 'shape': 'concave-hexagon', 'width': 14, 'height': 11, 'font-size': '8px', 'min-zoomed-font-size': 12 } },
    { selector: 'node[label="SecurityIssue"]', style: { 'background-color': '#7f1d1d', 'border-color': '#ef4444', 'border-width': 2, 'color': '#fca5a5', 'shape': 'vee', 'width': 14, 'height': 14, 'font-size': '8px', 'min-zoomed-font-size': 10 } },
    {
        selector: 'edge',
        style: {
            'width': 1,
            'line-color': '#1e293b',
            'target-arrow-color': '#1e293b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.6,
            'opacity': 0.35,
        }
    },
    {
        selector: 'edge[label="CALLS"]',
        style: {
            'line-color': '#fbbf24',
            'target-arrow-color': '#fbbf24',
            'opacity': 0.5,
            'width': 1.5,
        }
    },
    {
        selector: 'edge[label="DEPENDS_ON"]',
        style: {
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            'line-style': 'dashed',
            'opacity': 0.55,
            'width': 1.5,
        }
    },
    { selector: 'edge[label="IMPORTS"]', style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1', 'line-style': 'dashed', 'opacity': 0.35, 'width': 1 } },
    { selector: 'edge[label="EXPORTS"]', style: { 'line-color': '#8b5cf6', 'target-arrow-color': '#8b5cf6', 'line-style': 'dotted', 'opacity': 0.3, 'width': 0.8 } },
    { selector: 'edge[label="LISTENS_TO"]', style: { 'line-color': '#c084fc', 'target-arrow-color': '#c084fc', 'opacity': 0.5, 'width': 1.5 } },
    { selector: 'edge[label="EXTENDS"]', style: { 'line-color': '#a855f7', 'target-arrow-color': '#a855f7', 'target-arrow-shape': 'triangle-backcurve', 'opacity': 0.6, 'width': 2 } },
    { selector: 'edge[label="USES_ENV"]', style: { 'line-color': '#a1a1aa', 'target-arrow-color': '#a1a1aa', 'line-style': 'dotted', 'opacity': 0.35, 'width': 0.8 } },
    { selector: 'edge[label="HAS_SECURITY_ISSUE"]', style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', 'opacity': 0.8, 'width': 2 } },
    { selector: 'edge[label="CALLS_EXTERNAL"]', style: { 'line-color': '#818cf8', 'target-arrow-color': '#818cf8', 'opacity': 0.5, 'width': 1.5 } },
    {
        selector: 'node:selected',
        style: {
            'border-width': 3,
            'border-color': '#fff',
            'overlay-color': '#fff',
            'overlay-opacity': 0.15,
            'z-index': 999
        }
    },
    {
        selector: 'node.impact-source',
        style: {
            'border-color': '#ef4444',
            'border-width': 4,
            'overlay-color': '#ef4444',
            'overlay-opacity': 0.2,
            'z-index': 1000,
        }
    },
    {
        selector: 'node.impact-callee',
        style: {
            'border-color': '#f59e0b',
            'border-width': 2,
            'overlay-color': '#f59e0b',
            'overlay-opacity': 0.1,
            'z-index': 900,
        }
    },
    {
        selector: 'node.impact-caller',
        style: {
            'border-color': '#3b82f6',
            'border-width': 2,
            'overlay-color': '#3b82f6',
            'overlay-opacity': 0.1,
            'z-index': 900,
        }
    },
    {
        selector: 'edge.impact-edge',
        style: {
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'width': 2,
            'opacity': 0.8,
            'z-index': 900,
        }
    },
    {
        selector: 'node.faded',
        style: { 'opacity': 0.1 }
    },
    {
        selector: 'edge.faded',
        style: { 'opacity': 0.03 }
    },
    {
        selector: 'node.search-match',
        style: {
            'border-color': '#22d3ee',
            'border-width': 3,
            'overlay-color': '#22d3ee',
            'overlay-opacity': 0.2,
            'z-index': 1000,
        }
    },
    {
        selector: 'node.search-focus',
        style: {
            'border-color': '#f8fafc',
            'border-width': 4,
            'overlay-color': '#22d3ee',
            'overlay-opacity': 0.2,
            'z-index': 1050,
        }
    },
    {
        selector: 'edge.search-edge',
        style: {
            'opacity': 0.75,
            'width': 2,
            'line-color': '#22d3ee',
            'target-arrow-color': '#22d3ee',
            'z-index': 920,
        }
    },
    // Filter visibility control
    {
        selector: '.filter-hidden',
        style: { 'display': 'none' }
    },
];
