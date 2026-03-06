interface Props {
    projects: Array<{ id: string; name: string; rootPath: string }>;
    selectedId: string | undefined;
    onSelect: (id: string | undefined) => void;
}

/** Dropdown to pick a project — filters the entire graph */
export function ProjectSelector({ projects, selectedId, onSelect }: Props) {
    if (projects.length === 0) {
        return (
            <div className="text-[10px] font-mono text-slate-600 italic">
                No projects detected
            </div>
        );
    }

    return (
        <select
            value={selectedId ?? '__all__'}
            onChange={e => onSelect(e.target.value === '__all__' ? undefined : e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:border-cyan-600 focus:outline-none hover:border-slate-500 transition-colors cursor-pointer"
            title="Select project"
        >
            <option value="__all__">All projects</option>
            {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
    );
}
