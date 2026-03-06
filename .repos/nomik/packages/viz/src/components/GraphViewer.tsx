import { useEffect, useState, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { fetchGraphOverview, fetchGraphDataPaginated, type ViewMode } from '../neo4j';
import { graphStyles, graphStylesFast } from '../styles/graphStyles';
import { graphLayout } from '../styles/graphLayout';
import { getAdaptiveLayout } from '../styles/graphLayout';
import { SearchBar } from './SearchBar';
import { FilterPanel, type DirectoryInfo } from './FilterPanel';
import { NodeDetail } from './NodeDetail';
import { HelpButton } from './HelpModal';
import { LayoutSelector } from './LayoutSelector';

// Distinct colors for directory clustering (border color = directory)
const DIR_PALETTE = [
    '#06b6d4', '#f59e0b', '#10b981', '#a855f7', '#ef4444',
    '#3b82f6', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
    '#6366f1', '#d946ef', '#0ea5e9', '#eab308', '#22d3ee',
];
const DIR_FALLBACK = '#475569';

/** Rendering phase for progressive loading UX */
type Phase = 'loading' | 'computing' | 'streaming' | 'ready' | 'error';

interface GraphViewerProps {
    projectId?: string;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

/** Extract meaningful directory group from a file path (monorepo-aware) */
function extractDirectoryGroup(filePath: string): string {
    if (!filePath) return 'root';
    const normalized = filePath.replace(/\\/g, '/');
    const parts = normalized.split('/').filter(p => p.length > 0);
    parts.pop(); // Remove filename
    if (!parts.length) return 'root';

    // Monorepo: packages/X/src/Y → X/Y
    if (parts[0] === 'packages' && parts.length >= 2) {
        const pkg = parts[1]!;
        const rest = parts.slice(2).filter(p => p !== 'src' && p !== 'source');
        return rest.length > 0 ? `${pkg}/${rest[0]!}` : pkg;
    }

    // App root with src: backend/src/Y → backend/Y
    if (parts.length >= 2 && (parts[1] === 'src' || parts[1] === 'source')) {
        const root = parts[0]!;
        const sub = parts.slice(2);
        return sub.length > 0 ? `${root}/${sub[0]!}` : root;
    }

    // Simple src/source prefix
    if (parts[0] === 'src' || parts[0] === 'source') parts.shift();

    return parts[0] || 'root';
}

interface DirInfoResult {
    directories: DirectoryInfo[];
    nodeToDir: Map<string, string>;
    dirColors: Map<string, string>;
}

/** Compute directory assignments + colors for all nodes (no compound nodes) */
function buildDirectoryInfo(nodeEls: any[], edgeEls: any[]): DirInfoResult {
    const fileToDir = new Map<string, string>();
    const dirCounts = new Map<string, number>();

    for (const node of nodeEls) {
        if (node.data.label === 'File') {
            const path = node.data.path || node.data.filePath || node.data.name || '';
            const dir = extractDirectoryGroup(path);
            fileToDir.set(node.data.id, dir);
            dirCounts.set(dir, (dirCounts.get(dir) || 0) + 1);
        }
    }

    // Map Function/Class to their parent File's directory via CONTAINS edges
    const childToFile = new Map<string, string>();
    for (const edge of edgeEls) {
        if (edge.data.label === 'CONTAINS') {
            childToFile.set(edge.data.target, edge.data.source);
        }
    }

    const nodeToDir = new Map<string, string>();
    for (const node of nodeEls) {
        if (node.data.label === 'File') {
            nodeToDir.set(node.data.id, fileToDir.get(node.data.id)!);
        } else {
            const fileId = childToFile.get(node.data.id);
            if (fileId) {
                const dir = fileToDir.get(fileId);
                if (dir) {
                    nodeToDir.set(node.data.id, dir);
                    dirCounts.set(dir, (dirCounts.get(dir) || 0) + 1);
                }
            }
        }
    }

    // Assign a unique color to each directory (sorted by count)
    const sorted = Array.from(dirCounts.entries()).sort((a, b) => b[1] - a[1]);
    const dirColors = new Map<string, string>();
    const directories: DirectoryInfo[] = [];
    for (let i = 0; i < sorted.length; i++) {
        const [dir, count] = sorted[i]!;
        const color = DIR_PALETTE[i % DIR_PALETTE.length]!;
        dirColors.set(dir, color);
        directories.push({ name: dir, count, color });
    }

    return { directories, nodeToDir, dirColors };
}

/** Main 2D graph viewer — headless layout + directory grouping + progressive streaming */
export function GraphViewer({ projectId, viewMode, onViewModeChange }: GraphViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [phase, setPhase] = useState<Phase>('loading');
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<cytoscape.NodeSingular | null>(null);
    const [isLargeGraph, setIsLargeGraph] = useState(false);
    const [stats, setStats] = useState({ nodes: 0, edges: 0, streamed: 0 });
    const [directories, setDirectories] = useState<DirectoryInfo[]>([]);
    const [quality, setQuality] = useState<'full' | 'optimized'>('full');

    // Master effect: fetch → build directories → headless layout → stream
    useEffect(() => {
        if (!containerRef.current) return;
        let cancelled = false;

        // Destroy previous cy instance
        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }
        setPhase('loading');
        setError(null);
        setSelectedNode(null);
        setStats({ nodes: 0, edges: 0, streamed: 0 });
        setDirectories([]);

        async function run() {
            try {
                // ── Phase 1: Fetch data ──
                const data = viewMode === 'overview'
                    ? await fetchGraphOverview(projectId)
                    : await fetchGraphDataPaginated(projectId, 500);
                if (cancelled) return;

                const nodeEls = data.nodes;
                const edgeEls = data.edges;
                const nodeIds = new Set(nodeEls.map((n: any) => n.data.id));
                const validEdges = edgeEls.filter((e: any) =>
                    nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
                );

                // ── Build directory info (colors, no compound nodes) ──
                const { directories: dirs, nodeToDir, dirColors } = buildDirectoryInfo(nodeEls, validEdges);
                setDirectories(dirs);

                const large = nodeEls.length > 300;
                setIsLargeGraph(large);
                setStats({ nodes: nodeEls.length, edges: validEdges.length, streamed: 0 });

                // ── Phase 2: Compute flat layout (no compound nodes) ──
                setPhase('computing');
                await new Promise(r => requestAnimationFrame(r));
                if (cancelled) return;

                const flatElements = [...nodeEls, ...validEdges];
                const activeLayout = large ? getAdaptiveLayout(flatElements.length) : graphLayout;
                const activeStyles = large ? graphStylesFast : graphStyles;

                const headlessCy = cytoscape({
                    headless: true,
                    styleEnabled: false,
                    elements: flatElements,
                });

                const positions = new Map<string, { x: number; y: number }>();
                await new Promise<void>((resolve) => {
                    const layout = headlessCy.layout({
                        ...activeLayout,
                        animate: false,
                        fit: true,
                    });
                    layout.one('layoutstop', () => {
                        headlessCy.nodes().forEach((n: cytoscape.NodeSingular) => {
                            positions.set(n.id(), { ...n.position() });
                        });
                        resolve();
                    });
                    layout.run();
                });
                headlessCy.destroy();
                if (cancelled) return;

                // ── Phase 3: Stream elements progressively ──
                setPhase('streaming');

                const cy = cytoscape({
                    container: containerRef.current,
                    style: activeStyles,
                    minZoom: 0.1,
                    maxZoom: 4,
                    wheelSensitivity: 0.3,
                });
                cyRef.current = cy;

                if (large) {
                    try {
                        (cy as any).renderer().options.textureOnViewport = true;
                        (cy as any).renderer().options.hideEdgesOnViewport = true;
                    } catch (_) { /* optional renderer optimization */ }
                }

                const BATCH_SIZE = large ? 200 : 100;

                // Stream nodes with directory color + group data
                for (let i = 0; i < nodeEls.length; i += BATCH_SIZE) {
                    if (cancelled) return;
                    const batch = nodeEls.slice(i, i + BATCH_SIZE);
                    cy.batch(() => {
                        for (const el of batch) {
                            const pos = positions.get(el.data.id);
                            const dir = nodeToDir.get(el.data.id) ?? '';
                            const color = dirColors.get(dir) ?? DIR_FALLBACK;
                            const data = { ...el.data, dirGroup: dir, dirColor: color };
                            cy.add({ data, position: pos ?? { x: 0, y: 0 } });
                        }
                    });
                    setStats(s => ({ ...s, streamed: Math.min(i + BATCH_SIZE, nodeEls.length) }));
                    await new Promise(r => requestAnimationFrame(r));
                }

                // Stream edges
                for (let i = 0; i < validEdges.length; i += BATCH_SIZE * 2) {
                    if (cancelled) return;
                    const batch = validEdges.slice(i, i + BATCH_SIZE * 2);
                    cy.batch(() => {
                        for (const el of batch) cy.add(el);
                    });
                    await new Promise(r => requestAnimationFrame(r));
                }

                if (cancelled) return;
                cy.fit(undefined, 30);

                // Setup event handlers
                cy.on('tap', 'node', (evt) => {
                    const node = evt.target;

                    cy.elements().removeClass('impact-source impact-callee impact-caller impact-edge faded search-match search-focus search-edge');
                    setSelectedNode(node);

                    // Gather all connected edges
                    const allOutEdges = node.outgoers('edge');
                    const allInEdges = node.incomers('edge');
                    const allEdges = allOutEdges.union(allInEdges);

                    cy.elements().addClass('faded');
                    node.removeClass('faded').addClass('impact-source');

                    // Downstream (outgoing) targets
                    allOutEdges.targets().removeClass('faded').addClass('impact-callee');
                    // Upstream (incoming) sources
                    allInEdges.sources().removeClass('faded').addClass('impact-caller');
                    // All connected edges
                    allEdges.removeClass('faded').addClass('impact-edge');
                });
                cy.on('tap', (evt) => {
                    if (evt.target === cy) {
                        cy.elements().removeClass('impact-source impact-callee impact-caller impact-edge faded search-match search-focus search-edge');
                        setSelectedNode(null);
                    }
                });
                if (!large) {
                    cy.on('mouseover', 'edge', (evt) => {
                        evt.target.style('label', evt.target.data('label'));
                        evt.target.style('font-size', '9px');
                        evt.target.style('color', '#94a3b8');
                        evt.target.style('text-background-color', '#020617');
                        evt.target.style('text-background-opacity', 0.8);
                        evt.target.style('text-background-padding', '2px');
                        evt.target.style('text-rotation', 'autorotate');
                    });
                    cy.on('mouseout', 'edge', (evt) => {
                        evt.target.style('label', '');
                    });
                }

                // ── LOD: Zoom-based level-of-detail ──
                // When zoomed out, hide non-File nodes to reduce visual clutter
                const LOD_THRESHOLD = 0.6;
                let lodState: 'detail' | 'overview' = 'detail';
                cy.on('zoom', () => {
                    const z = cy.zoom();
                    if (z < LOD_THRESHOLD && lodState === 'detail') {
                        lodState = 'overview';
                        cy.batch(() => {
                            cy.nodes('[label != "File"]').style('display', 'none');
                            cy.edges().style('display', 'none');
                            cy.edges('[label = "DEPENDS_ON"]').style('display', 'element');
                        });
                    } else if (z >= LOD_THRESHOLD && lodState === 'overview') {
                        lodState = 'detail';
                        cy.batch(() => {
                            cy.elements().style('display', 'element');
                        });
                    }
                });

                setPhase('ready');

            } catch (err: any) {
                if (!cancelled) {
                    console.error('GraphViewer error:', err);
                    setError(err.message);
                    setPhase('error');
                }
            }
        }

        run();

        return () => {
            cancelled = true;
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [projectId, viewMode]);

    // Apply quality-dependent edge styles on toggle
    useEffect(() => {
        const cy = cyRef.current;
        if (!cy || phase !== 'ready') return;
        const full = quality === 'full';
        cy.style().fromJson(full ? graphStyles : graphStylesFast).update();

        try {
            const renderer = (cy as any).renderer?.();
            if (renderer?.options) {
                renderer.options.textureOnViewport = !full && isLargeGraph;
                renderer.options.hideEdgesOnViewport = !full && isLargeGraph;
            }
        } catch (_) {
            // optional renderer optimization toggles
        }
    }, [quality, phase, isLargeGraph]);

    const handleCloseDetail = useCallback(() => {
        const cy = cyRef.current;
        if (!cy) return;
        cy.elements().removeClass('impact-source impact-callee impact-caller impact-edge faded search-match search-focus search-edge');
        setSelectedNode(null);
    }, []);

    const phaseMessage = phase === 'loading' ? (viewMode === 'overview' ? 'FETCHING OVERVIEW...' : 'FETCHING GRAPH DATA...')
        : phase === 'computing' ? `COMPUTING LAYOUT (${stats.nodes} nodes, ${stats.edges} edges)...`
        : phase === 'streaming' ? `STREAMING ${stats.streamed}/${stats.nodes} nodes...`
        : null;

    return (
        <div className="w-full h-full flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <SearchBar cy={cyRef.current} />
                    <HelpButton />
                    <LayoutSelector cy={cyRef.current} animate={quality === 'full'} />
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
                    {/* Quality toggle */}
                    <div className="flex items-center gap-1 bg-slate-900 rounded border border-slate-700 p-0.5">
                        <button
                            onClick={() => setQuality('full')}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${quality === 'full' ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                            title="Full quality: smooth layout animations, high edge visibility"
                        >
                            Full Quality
                        </button>
                        <button
                            onClick={() => setQuality('optimized')}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${quality === 'optimized' ? 'bg-amber-900/60 text-amber-400 border border-amber-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                            title="Optimized: instant layouts, reduced visuals for large graphs"
                        >
                            Optimized
                        </button>
                    </div>
                    {isLargeGraph && phase === 'ready' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/40 text-amber-400 border border-amber-800">
                            LARGE GRAPH
                        </span>
                    )}
                </div>
                {phase === 'ready' && <FilterPanel cy={cyRef.current} directories={directories} />}
            </div>

            {/* Graph + Detail panel */}
            <div className="flex-1 border border-slate-800 bg-[#020617] rounded-lg overflow-hidden relative shadow-2xl shadow-cyan-900/20">
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h2 className="text-xs font-mono text-cyan-500/50 tracking-[0.2em] uppercase">
                        {viewMode === 'overview' ? 'File Overview' : 'System Visualization'}
                    </h2>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 text-[10px] font-mono pointer-events-none flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-slate-800 border border-cyan-500 inline-block" /> File</span>
                    {viewMode === 'full' && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-800 border border-emerald-500 inline-block" /> Function</span>}
                    {viewMode === 'full' && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-800 border border-purple-500 inline-block" style={{ transform: 'rotate(45deg)' }} /> Class</span>}
                    {directories.length > 0 && (
                        <>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-500">Border color = directory</span>
                            {directories.slice(0, 6).map(d => (
                                <span key={d.name} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                                    <span className="text-slate-500">{d.name}</span>
                                </span>
                            ))}
                            {directories.length > 6 && <span className="text-slate-600">+{directories.length - 6}</span>}
                        </>
                    )}
                </div>

                {/* Cytoscape container */}
                <div ref={containerRef} className="w-full h-full" />

                {/* Phase overlays */}
                {phaseMessage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-950/80 pointer-events-none">
                        <div className="text-cyan-400 font-mono text-sm animate-pulse">{phaseMessage}</div>
                        {phase === 'streaming' && (
                            <div className="mt-3 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-200"
                                    style={{ width: `${stats.nodes > 0 ? (stats.streamed / stats.nodes) * 100 : 0}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {phase === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="text-red-500 font-mono text-sm">SYSTEM ERROR: {error}</div>
                    </div>
                )}

                <NodeDetail node={selectedNode} onClose={handleCloseDetail} />
            </div>
        </div>
    );
}
