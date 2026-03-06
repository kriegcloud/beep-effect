import { useState, useEffect } from 'react';
import { GraphViewer } from './components/GraphViewer';
import { Graph3DViewer } from './components/Graph3DViewer';
import { ProjectSelector } from './components/ProjectSelector';
import { StatsPanel } from './components/StatsPanel';
import { fetchProjects, fetchHealthStats, invalidateCache, type HealthStats, type ViewMode } from './neo4j';

function App() {
    const [mode, setMode] = useState<'3d' | '2d'>('3d');
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const [projects, setProjects] = useState<Array<{ id: string; name: string; rootPath: string }>>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
    const [stats, setStats] = useState<HealthStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Load projects on mount
    useEffect(() => {
        fetchProjects()
            .then(p => {
                setProjects(p);
                if (p.length === 0) return;

                const preferred = p.find(project => {
                    const name = project.name.toLowerCase();
                    const root = project.rootPath.toLowerCase();
                    return name === 'nomik' || root.includes('\\genome') || root.includes('/genome');
                }) ?? p[0];

                if (preferred) setSelectedProjectId(preferred.id);
            })
            .catch(err => console.error('Failed to load projects:', err));
    }, []);

    // Reload stats when project changes
    useEffect(() => {
        invalidateCache();
        setStatsLoading(true);
        fetchHealthStats(selectedProjectId)
            .then(s => { setStats(s); setStatsLoading(false); })
            .catch(err => {
                console.error('Failed to load health stats:', err);
                setStats(null);
                setStatsLoading(false);
            });
    }, [selectedProjectId]);

    return (
        <div className="flex h-screen w-full flex-col bg-gray-950 text-white">
            <header className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight text-cyan-400 font-mono">NOMIK</h1>
                    <span className="text-[10px] font-mono text-slate-600 tracking-wider uppercase">Knowledge Graph</span>
                </div>
                <div className="flex items-center gap-3">
                    <ProjectSelector
                        projects={projects}
                        selectedId={selectedProjectId}
                        onSelect={setSelectedProjectId}
                    />
                    <div className="flex items-center gap-1 bg-slate-900 rounded border border-slate-700 p-0.5">
                        <button
                            onClick={() => setMode('3d')}
                            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${mode === '3d' ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                        >
                            3D
                        </button>
                        <button
                            onClick={() => setMode('2d')}
                            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${mode === '2d' ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                        >
                            2D
                        </button>
                    </div>
                    <div className="text-xs font-mono text-slate-500">v0.1.0</div>
                </div>
            </header>
            <main className="flex-1 flex overflow-hidden">
                {/* Stats sidebar */}
                <StatsPanel stats={stats} loading={statsLoading} />
                {/* Graph viewer */}
                <div className="flex-1 p-3 overflow-hidden">
                    {mode === '3d'
                        ? <Graph3DViewer projectId={selectedProjectId} viewMode={viewMode} onViewModeChange={setViewMode} />
                        : <GraphViewer projectId={selectedProjectId} viewMode={viewMode} onViewModeChange={setViewMode} />
                    }
                </div>
            </main>
        </div>
    );
}

export default App;
