import { useState } from 'react';
import type { HealthStats } from '../neo4j';

interface Props {
    stats: HealthStats | null;
    loading: boolean;
}

/** Extract short filename from a full path */
function basename(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] ?? filePath;
}

/** Sidebar with graph metrics, health details, and full node type breakdown */
export function StatsPanel({ stats, loading }: Props) {
    const [showDeadCode, setShowDeadCode] = useState(false);
    const [showGodObjects, setShowGodObjects] = useState(false);
    const [showGodFiles, setShowGodFiles] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);

    if (loading || !stats) {
        return (
            <aside className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4 shrink-0">
                <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase">Health</h2>
                <div className="text-xs font-mono text-slate-600 animate-pulse">Loading...</div>
            </aside>
        );
    }

    const primaryMetrics: Array<{ label: string; value: number; color: string }> = [
        { label: 'Nodes', value: stats.nodeCount, color: 'text-slate-300' },
        { label: 'Edges', value: stats.edgeCount, color: 'text-slate-300' },
    ];

    const nodeTypeMetrics: Array<{ label: string; value: number; color: string }> = [
        { label: 'Files', value: stats.fileCount, color: 'text-cyan-400' },
        { label: 'Functions', value: stats.functionCount, color: 'text-emerald-400' },
        { label: 'Classes', value: stats.classCount, color: 'text-purple-400' },
        { label: 'Routes', value: stats.routeCount, color: 'text-amber-400' },
        { label: 'Variables', value: stats.variableCount, color: 'text-blue-400' },
        { label: 'Events', value: stats.eventCount, color: 'text-purple-300' },
        { label: 'Env Vars', value: stats.envVarCount, color: 'text-slate-400' },
        { label: 'Modules', value: stats.moduleCount, color: 'text-cyan-300' },
        { label: 'DB Tables', value: stats.dbTableCount, color: 'text-orange-400' },
        { label: 'External APIs', value: stats.externalApiCount, color: 'text-indigo-400' },
        { label: 'Security Issues', value: stats.securityIssueCount, color: 'text-red-400' },
    ].filter(m => m.value > 0);

    return (
        <aside className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
            {/* Primary counts */}
            <div>
                <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Graph</h2>
                <div className="space-y-1.5">
                    {primaryMetrics.map(m => (
                        <div key={m.label} className="flex justify-between items-center">
                            <span className="text-[11px] font-mono text-slate-500">{m.label}</span>
                            <span className={`text-sm font-mono font-bold ${m.color}`}>{m.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Node type breakdown */}
            <div>
                <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Node Types</h2>
                <div className="space-y-1">
                    {nodeTypeMetrics.map(m => (
                        <div key={m.label} className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-slate-500">{m.label}</span>
                            <span className={`text-xs font-mono font-bold ${m.color}`}>{m.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Health */}
            <div>
                <h2 className="text-xs font-mono text-slate-500 tracking-wider uppercase mb-3">Health</h2>

                {/* Dead code — clickable to show details */}
                <HealthRow
                    label="Dead code"
                    count={stats.deadCodeCount}
                    isOpen={showDeadCode}
                    onToggle={() => setShowDeadCode(!showDeadCode)}
                    badColor="text-red-400"
                />
                {showDeadCode && stats.deadCodeItems.length > 0 && (
                    <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
                        {stats.deadCodeItems.map((item, i) => (
                            <div key={`dc-${i}`} className="group">
                                <div className="text-[10px] font-mono text-red-300/80 truncate" title={item.name}>{item.name}</div>
                                <div className="text-[9px] font-mono text-slate-600 truncate" title={item.filePath}>{basename(item.filePath)}</div>
                            </div>
                        ))}
                    </div>
                )}
                {showDeadCode && stats.deadCodeItems.length === 0 && (
                    <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No dead code</div>
                )}

                {/* God objects */}
                <HealthRow
                    label="God objects"
                    count={stats.godObjectCount}
                    isOpen={showGodObjects}
                    onToggle={() => setShowGodObjects(!showGodObjects)}
                    badColor="text-orange-400"
                />
                {showGodObjects && stats.godObjectItems.length > 0 && (
                    <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
                        {stats.godObjectItems.map((item, i) => (
                            <div key={`go-${i}`} className="group">
                                <div className="text-[10px] font-mono text-orange-300/80 truncate flex justify-between" title={item.name}>
                                    <span className="truncate">{item.name}</span>
                                    <span className="text-orange-400/60 ml-1 shrink-0">{item.depCount} deps</span>
                                </div>
                                <div className="text-[9px] font-mono text-slate-600 truncate" title={item.filePath}>{basename(item.filePath)}</div>
                            </div>
                        ))}
                    </div>
                )}
                {showGodObjects && stats.godObjectItems.length === 0 && (
                    <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No god objects</div>
                )}

                {/* God files */}
                <HealthRow
                    label="God files"
                    count={stats.godFileCount}
                    isOpen={showGodFiles}
                    onToggle={() => setShowGodFiles(!showGodFiles)}
                    badColor="text-amber-400"
                />
                {showGodFiles && stats.godFileItems.length > 0 && (
                    <div className="ml-3 mt-1 mb-2 space-y-1 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
                        {stats.godFileItems.map((item, i) => (
                            <div key={`gf-${i}`} className="group">
                                <div className="text-[10px] font-mono text-amber-300/80 truncate flex justify-between" title={item.filePath}>
                                    <span className="truncate">{basename(item.filePath)}</span>
                                    <span className="text-amber-400/60 ml-1 shrink-0">{item.functionCount} fn</span>
                                </div>
                                {item.totalLines > 0 && (
                                    <div className="text-[9px] font-mono text-slate-600">{item.totalLines} lines</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {showGodFiles && stats.godFileItems.length === 0 && (
                    <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No god files</div>
                )}

                {/* Duplicates */}
                <HealthRow
                    label="Duplicates"
                    count={stats.duplicateCount}
                    isOpen={showDuplicates}
                    onToggle={() => setShowDuplicates(!showDuplicates)}
                    badColor="text-yellow-400"
                />
                {showDuplicates && stats.duplicateGroups.length > 0 && (
                    <div className="ml-3 mt-1 mb-2 space-y-2 max-h-48 overflow-y-auto border-l border-gray-800 pl-2">
                        {stats.duplicateGroups.map((group, i) => (
                            <div key={`dup-${i}`}>
                                <div className="text-[10px] font-mono text-yellow-300/80">{group.count} copies:</div>
                                {group.functions.map((fn, j) => (
                                    <div key={`dup-${i}-${j}`} className="text-[9px] font-mono text-slate-500 truncate pl-1" title={fn.filePath}>
                                        {fn.name} <span className="text-slate-600">({basename(fn.filePath)})</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                {showDuplicates && stats.duplicateGroups.length === 0 && (
                    <div className="ml-3 mt-1 mb-2 text-[10px] font-mono text-emerald-400/60">No duplicates</div>
                )}

                {/* Security issues summary */}
                {stats.securityIssueCount > 0 && (
                    <div className="flex justify-between items-center py-1 px-1 -mx-1">
                        <span className="text-[11px] font-mono text-slate-500">Security issues</span>
                        <span className="text-sm font-mono font-bold text-red-400">{stats.securityIssueCount}<span className="ml-1 text-[9px]">!</span></span>
                    </div>
                )}
            </div>

            {/* Health score */}
            <div className="border-t border-gray-800 pt-3">
                <HealthScore stats={stats} />
            </div>
        </aside>
    );
}

/** Reusable health metric row with expand toggle */
function HealthRow({ label, count, isOpen, onToggle, badColor }: {
    label: string; count: number; isOpen: boolean; onToggle: () => void; badColor: string;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center py-1 hover:bg-slate-900/50 rounded px-1 -mx-1 transition-colors"
        >
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <span className={`text-[9px] transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                {label}
            </span>
            <span className={`text-sm font-mono font-bold ${count > 0 ? badColor : 'text-emerald-400'}`}>
                {count}
                {count > 0 && <span className="ml-1 text-[9px]">!</span>}
            </span>
        </button>
    );
}

/** Visual health score indicator
 *  Formula: penalizes proportionally for dead code, god objects, god files, duplicates, and security issues
 */
function HealthScore({ stats }: { stats: HealthStats }) {
    const total = stats.functionCount || 1;
    const deadPenalty = Math.min(25, Math.round((stats.deadCodeCount / total) * 100));
    const godObjPenalty = Math.min(20, stats.godObjectCount * 5);
    const godFilePenalty = Math.min(15, stats.godFileCount * 3);
    const dupPenalty = Math.min(10, stats.duplicateCount * 2);
    const secPenalty = Math.min(30, stats.securityIssueCount * 10);
    const score = Math.max(0, 100 - deadPenalty - godObjPenalty - godFilePenalty - dupPenalty - secPenalty);

    const getColor = (s: number) => {
        if (s >= 80) return 'text-emerald-400';
        if (s >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getLabel = (s: number) => {
        if (s >= 80) return 'Healthy';
        if (s >= 50) return 'Fair';
        return 'Needs attention';
    };

    return (
        <div className="text-center">
            <div className={`text-2xl font-mono font-bold ${getColor(score)}`}>{score}%</div>
            <div className={`text-[10px] font-mono ${getColor(score)}`}>{getLabel(score)}</div>
        </div>
    );
}
