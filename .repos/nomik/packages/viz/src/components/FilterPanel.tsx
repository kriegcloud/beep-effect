import { useState, useCallback, useEffect, useRef } from 'react';
import type cytoscape from 'cytoscape';

export interface DirectoryInfo {
    name: string;
    count: number;
    color?: string;
}

interface FilterPanelProps {
    cy: cytoscape.Core | null;
    directories: DirectoryInfo[];
}

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

const EDGE_COLORS: Record<string, string> = {
    CONTAINS: '#475569',
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

/** Dynamic filter panel with checkbox groups for types, directories, and edges */
export function FilterPanel({ cy, directories }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [nodeFilters, setNodeFilters] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        for (const k of Object.keys(NODE_COLORS)) init[k] = true;
        return init;
    });
    const [dirFilters, setDirFilters] = useState<Record<string, boolean>>({});
    const [edgeFilters, setEdgeFilters] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        for (const k of Object.keys(EDGE_COLORS)) init[k] = true;
        return init;
    });
    const [counts, setCounts] = useState<Record<string, number>>({});
    const panelRef = useRef<HTMLDivElement>(null);

    // Initialize directory filters when directories change
    useEffect(() => {
        const init: Record<string, boolean> = {};
        for (const d of directories) init[d.name] = true;
        setDirFilters(init);
    }, [directories]);

    // Count elements when cy changes
    useEffect(() => {
        if (!cy) return;
        const c: Record<string, number> = {};
        for (const l of Object.keys(NODE_COLORS)) { c[l] = cy.nodes(`[label="${l}"]`).length; }
        for (const l of Object.keys(EDGE_COLORS)) { c[l] = cy.edges(`[label="${l}"]`).length; }
        setCounts(c);
    }, [cy]);

    // Close panel on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Apply all filters to cy — recomputes from scratch each time
    const applyFilters = useCallback((
        nf: Record<string, boolean>,
        df: Record<string, boolean>,
        ef: Record<string, boolean>,
    ) => {
        if (!cy) return;
        cy.batch(() => {
            // Reset all
            cy.elements().removeClass('filter-hidden');

            // Hide by node type
            for (const [type, visible] of Object.entries(nf)) {
                if (!visible) cy.nodes(`[label="${type}"]`).addClass('filter-hidden');
            }

            // Hide by directory
            for (const [dir, visible] of Object.entries(df)) {
                if (!visible) {
                    cy.nodes(`[dirGroup="${dir}"]`).addClass('filter-hidden');
                }
            }

            // Hide by edge type
            for (const [type, visible] of Object.entries(ef)) {
                if (!visible) cy.edges(`[label="${type}"]`).addClass('filter-hidden');
            }
        });
    }, [cy]);

    const toggleNode = (type: string) => {
        setNodeFilters(prev => {
            const next = { ...prev, [type]: !prev[type] };
            applyFilters(next, dirFilters, edgeFilters);
            return next;
        });
    };

    const toggleDir = (dir: string) => {
        setDirFilters(prev => {
            const next = { ...prev, [dir]: !prev[dir] };
            applyFilters(nodeFilters, next, edgeFilters);
            return next;
        });
    };

    const toggleEdge = (type: string) => {
        setEdgeFilters(prev => {
            const next = { ...prev, [type]: !prev[type] };
            applyFilters(nodeFilters, dirFilters, next);
            return next;
        });
    };

    const toggleAllDirs = (visible: boolean) => {
        const next: Record<string, boolean> = {};
        for (const d of directories) next[d.name] = visible;
        setDirFilters(next);
        applyFilters(nodeFilters, next, edgeFilters);
    };

    const hiddenCount = Object.values(nodeFilters).filter(v => !v).length
        + Object.values(dirFilters).filter(v => !v).length
        + Object.values(edgeFilters).filter(v => !v).length;

    return (
        <div ref={panelRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                    isOpen ? 'border-cyan-600 text-cyan-400 bg-cyan-950/30' : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {hiddenCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-900/60 text-amber-400 text-[9px]">{hiddenCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/40 p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                    {/* Node Types */}
                    <div>
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Node Types</h4>
                        {Object.entries(NODE_COLORS).filter(([type]) => (counts[type] ?? 0) > 0).map(([type, color]) => (
                            <label key={type} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={nodeFilters[type] ?? true}
                                    onChange={() => toggleNode(type)}
                                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 w-3.5 h-3.5"
                                />
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-xs font-mono text-slate-300 group-hover:text-white flex-1">{type}</span>
                                <span className="text-[10px] font-mono text-slate-600">{counts[type] ?? 0}</span>
                            </label>
                        ))}
                    </div>

                    {/* Directory Layers */}
                    {directories.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Layers</h4>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleAllDirs(true)} className="text-[9px] font-mono text-slate-600 hover:text-cyan-400">All</button>
                                    <button onClick={() => toggleAllDirs(false)} className="text-[9px] font-mono text-slate-600 hover:text-amber-400">None</button>
                                </div>
                            </div>
                            {directories.map(d => (
                                <label key={d.name} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={dirFilters[d.name] ?? true}
                                        onChange={() => toggleDir(d.name)}
                                        className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 w-3.5 h-3.5"
                                    />
                                    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: d.color ?? '#475569' }} />
                                    <span className="text-xs font-mono text-slate-300 group-hover:text-white flex-1">{d.name}</span>
                                    <span className="text-[10px] font-mono text-slate-600">{d.count}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Edge Types */}
                    <div>
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Edge Types</h4>
                        {Object.entries(EDGE_COLORS).filter(([type]) => (counts[type] ?? 0) > 0).map(([type, color]) => (
                            <label key={type} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={edgeFilters[type] ?? true}
                                    onChange={() => toggleEdge(type)}
                                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 w-3.5 h-3.5"
                                />
                                <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
                                <span className="text-xs font-mono text-slate-300 group-hover:text-white flex-1">{type}</span>
                                <span className="text-[10px] font-mono text-slate-600">{counts[type] ?? 0}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
