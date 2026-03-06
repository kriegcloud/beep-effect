import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchGraphData, fetchGraphOverview, type ViewMode } from '../neo4j';
import { HelpButton } from './HelpModal';

/** Colors by node type */
const NODE_COLORS: Record<string, string> = {
    File: '#06b6d4',
    Function: '#10b981',
    Class: '#a855f7',
    Route: '#f59e0b',
    Variable: '#60a5fa',
    Event: '#c084fc',
    EnvVar: '#a1a1aa',
    Module: '#22d3ee',
    DBTable: '#fb923c',
    DBColumn: '#f97316',
    ExternalAPI: '#818cf8',
    CronJob: '#a3e635',
    QueueJob: '#e879f9',
    Metric: '#2dd4bf',
    Span: '#38bdf8',
    Topic: '#a78bfa',
    SecurityIssue: '#ef4444',
};

/** Colors by edge type */
const EDGE_COLORS: Record<string, string> = {
    CONTAINS: '#334155',
    CALLS: '#f59e0b',
    DEPENDS_ON: '#38bdf8',
    IMPORTS: '#6366f1',
    EXPORTS: '#8b5cf6',
    LISTENS_TO: '#c084fc',
    EXTENDS: '#a855f7',
    USES_ENV: '#a1a1aa',
    HAS_SECURITY_ISSUE: '#ef4444',
    CALLS_EXTERNAL: '#818cf8',
};

/** Adaptive quality thresholds */
const PERF = {
    SMALL: 300,     // < 300 nodes = full quality
    MEDIUM: 800,    // 300-800 = reduced quality
    LARGE: 1500,    // 800-1500 = minimal quality
    // > 1500 = extreme optimization
};

interface NodeObj {
    id: string;
    label: string;
    name: string;
    [key: string]: any;
}

interface Graph3DViewerProps {
    projectId?: string;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

/** 3D viewer with adaptive quality — scales to any project size */
export function Graph3DViewer({ projectId, viewMode, onViewModeChange }: Graph3DViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeObj | null>(null);
    const [stats, setStats] = useState({ nodes: 0, edges: 0 });
    const [perfLevel, setPerfLevel] = useState<'small' | 'medium' | 'large' | 'extreme'>('small');

    // Reload when projectId or viewMode changes
    useEffect(() => {
        if (!containerRef.current) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setSelectedNode(null);

        // Clean up previous graph instance
        if (graphRef.current) {
            graphRef.current._destructor?.();
            graphRef.current = null;
        }

        async function init() {
            try {
                const mod: any = await import('3d-force-graph');
                const ForceGraph3D = mod.default ?? mod;

                if (cancelled || !containerRef.current) return;
                containerRef.current.innerHTML = '';

                // Load data based on view mode
                const data = viewMode === 'overview'
                    ? await fetchGraphOverview(projectId)
                    : await fetchGraphData(projectId);
                if (cancelled) return;

                const nodes = data.nodes.map((n: any) => ({
                    id: n.data.id,
                    label: n.data.label,
                    name: n.data.name,
                    ...n.data,
                }));
                const links = data.edges.map((e: any) => ({
                    source: e.data.source,
                    target: e.data.target,
                    label: e.data.label,
                }));

                // Determine performance level
                const nodeCount = nodes.length;
                const edgeCount = links.length;
                const level = nodeCount < PERF.SMALL ? 'small'
                    : nodeCount < PERF.MEDIUM ? 'medium'
                    : nodeCount < PERF.LARGE ? 'large'
                    : 'extreme';
                setPerfLevel(level);
                console.log(`[Perf] ${nodeCount} nodes, ${edgeCount} edges → ${level} quality`);

                // Adaptive parameters — warmup HIGH (pre-converge), cooldown ZERO (no visible organizing)
                const resolution = level === 'small' ? 16 : level === 'medium' ? 8 : 4;
                const warmup = Math.min(400, Math.max(120, Math.floor(nodeCount / 3))); // More nodes = more warmup
                const cooldown = level === 'small' ? 50 : 0; // Near-zero: graph appears organized from start
                const enableParticles = level === 'small';
                const linkOpacity = level === 'extreme' ? 0.15 : 0.35;
                const nodeOpacity = level === 'extreme' ? 0.8 : 0.92;

                const graph = ForceGraph3D()(containerRef.current)
                    .backgroundColor('#020617')
                    .nodeLabel((node: any) => {
                        const extra = node.childCount ? `<br/><span style="color:#64748b">${node.childCount} symbols</span>` : '';
                        return `<div style="background:#0f172a;color:#e2e8f0;padding:6px 10px;border-radius:6px;font-family:monospace;font-size:11px;border:1px solid #334155;box-shadow:0 4px 20px rgba(0,0,0,.5)"><b style="color:${NODE_COLORS[node.label] ?? '#94a3b8'}">${node.label}</b><br/>${node.name}${extra}</div>`;
                    })
                    .nodeColor((node: any) => NODE_COLORS[node.label] ?? '#475569')
                    .nodeVal((node: any) => {
                        // In overview, size by child count
                        if (viewMode === 'overview' && node.childCount) {
                            return Math.max(2, Math.min(20, node.childCount / 2));
                        }
                        if (node.label === 'File') return 6;
                        if (node.label === 'Class') return 4;
                        return 1.5;
                    })
                    .nodeOpacity(nodeOpacity)
                    .nodeResolution(resolution)
                    .linkColor((link: any) => EDGE_COLORS[link.label] ?? '#1e293b')
                    .linkOpacity(linkOpacity)
                    .linkWidth((link: any) => link.label === 'CALLS' ? 1.2 : link.label === 'DEPENDS_ON' ? 1.8 : 0.4)
                    .onNodeClick((node: any) => {
                        setSelectedNode(node);
                        const distance = 120;
                        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
                        graph.cameraPosition(
                            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                            node,
                            1500,
                        );
                    })
                    .onBackgroundClick(() => setSelectedNode(null))
                    .warmupTicks(warmup)
                    .cooldownTicks(cooldown);

                // Only enable particles for small graphs (huge GPU cost)
                if (enableParticles) {
                    graph
                        .linkDirectionalParticles((link: any) => link.label === 'CALLS' ? 2 : link.label === 'DEPENDS_ON' ? 1 : 0)
                        .linkDirectionalParticleSpeed(0.004)
                        .linkDirectionalParticleColor((link: any) => EDGE_COLORS[link.label] ?? '#475569')
                        .linkDirectionalParticleWidth(1.2);
                }

                // For extreme graphs, hide labels entirely
                if (level === 'extreme') {
                    graph.nodeLabel(() => '');
                }

                graphRef.current = graph;
                graph.graphData({ nodes, links });
                setStats({ nodes: nodes.length, edges: links.length });
                setLoading(false);

                // Slow auto-rotation only for small/medium graphs
                if (level === 'small' || level === 'medium') {
                    let angle = 0;
                    const rotateInterval = setInterval(() => {
                        if (!graphRef.current) { clearInterval(rotateInterval); return; }
                        angle += 0.15;
                        graphRef.current.cameraPosition({
                            x: 350 * Math.sin((angle * Math.PI) / 180),
                            z: 350 * Math.cos((angle * Math.PI) / 180),
                        });
                    }, 40);
                    containerRef.current?.addEventListener('mousedown', () => {
                        clearInterval(rotateInterval);
                    }, { once: true });
                }

            } catch (err: any) {
                if (!cancelled) {
                    console.error('Graph3D init error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        init();

        const handleResize = () => {
            if (containerRef.current && graphRef.current) {
                graphRef.current.width(containerRef.current.clientWidth);
                graphRef.current.height(containerRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelled = true;
            window.removeEventListener('resize', handleResize);
            if (graphRef.current) {
                graphRef.current._destructor?.();
                graphRef.current = null;
            }
        };
    }, [projectId, viewMode]);

    /** Fit graph to view */
    const handleFitView = useCallback(() => {
        graphRef.current?.zoomToFit(500, 50);
    }, []);

    const perfBadge = perfLevel === 'small' ? null
        : <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
            perfLevel === 'medium' ? 'bg-amber-900/40 text-amber-400 border border-amber-800'
            : perfLevel === 'large' ? 'bg-orange-900/40 text-orange-400 border border-orange-800'
            : 'bg-red-900/40 text-red-400 border border-red-800'
        }`}>{perfLevel === 'medium' ? 'REDUCED' : perfLevel === 'large' ? 'LOW' : 'MINIMAL'} quality</span>;

    return (
        <div className="w-full h-full flex flex-col gap-3">
            {/* Toolbar — always visible */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <HelpButton />
                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-slate-900 rounded border border-slate-700 p-0.5">
                        <button
                            onClick={() => onViewModeChange('overview')}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${viewMode === 'overview' ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => onViewModeChange('full')}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${viewMode === 'full' ? 'bg-amber-900/60 text-amber-400 border border-amber-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                        >
                            Full Graph
                        </button>
                    </div>
                    {!loading && (
                        <button
                            onClick={handleFitView}
                            className="px-3 py-1 rounded text-xs font-mono border border-slate-700 hover:border-cyan-600 hover:text-cyan-400 text-slate-400 transition-all"
                        >
                            Fit View
                        </button>
                    )}
                    {perfBadge}
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#06b6d4' }} /> File</span>
                    {viewMode === 'full' && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#10b981' }} /> Function</span>}
                    {viewMode === 'full' && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#a855f7' }} /> Class</span>}
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">{stats.nodes} nodes</span>
                    <span className="text-slate-400">{stats.edges} edges</span>
                </div>
            </div>

            {/* 3D graph container */}
            <div className="flex-1 border border-slate-800 bg-[#020617] rounded-lg overflow-hidden relative shadow-2xl shadow-cyan-900/20">
                <div ref={containerRef} className="w-full h-full" />

                {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-cyan-400 font-mono text-sm animate-pulse">
                            {viewMode === 'overview' ? 'LOADING OVERVIEW...' : 'LOADING FULL GRAPH...'}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-red-500 font-mono text-sm">SYSTEM ERROR: {error}</div>
                    </div>
                )}

                {/* Overview hint */}
                {viewMode === 'overview' && !loading && !error && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="text-slate-500 font-mono text-[10px] bg-slate-900/80 px-3 py-1 rounded border border-slate-800">
                            FILE-LEVEL VIEW — click a node for details, switch to Full Graph for all symbols
                        </div>
                    </div>
                )}

                {selectedNode && (
                    <div className="absolute top-4 right-4 w-72 bg-slate-900/95 border border-slate-700 rounded-lg p-4 text-xs font-mono backdrop-blur-sm z-20">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-cyan-400 font-bold text-sm">{selectedNode.name}</span>
                            <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">x</button>
                        </div>
                        <div className="space-y-1 text-slate-300">
                            <div><span className="text-slate-500">type:</span> {selectedNode.label}</div>
                            {selectedNode.filePath && <div><span className="text-slate-500">file:</span> {(selectedNode.filePath as string).split(/[/\\]/).pop()}</div>}
                            {selectedNode.startLine && <div><span className="text-slate-500">line:</span> {selectedNode.startLine}</div>}
                            {selectedNode.language && <div><span className="text-slate-500">lang:</span> {selectedNode.language}</div>}
                            {selectedNode.childCount != null && <div><span className="text-slate-500">symbols:</span> {selectedNode.childCount} ({selectedNode.funcCount} fn, {selectedNode.classCount} cls)</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
