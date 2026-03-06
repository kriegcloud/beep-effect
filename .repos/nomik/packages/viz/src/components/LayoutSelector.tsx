import { useState, useCallback } from 'react';
import type cytoscape from 'cytoscape';
import { type LayoutName, getLayout } from '../styles/graphLayout';

interface LayoutSelectorProps {
    cy: cytoscape.Core | null;
    animate?: boolean;
}

const LAYOUTS: { name: LayoutName; label: string; desc: string }[] = [
    { name: 'cose', label: 'Modules', desc: 'Group by directory — see architecture' },
    { name: 'breadthfirst', label: 'Flow', desc: 'Top-down dependency hierarchy' },
    { name: 'concentric', label: 'Hub', desc: 'Most-connected nodes in center' },
];

/** Semantic layout selector — meaningful views instead of abstract math */
export function LayoutSelector({ cy, animate = false }: LayoutSelectorProps) {
    const [active, setActive] = useState<LayoutName>('cose');

    const applyLayout = useCallback((name: LayoutName) => {
        if (!cy) return;
        setActive(name);
        const opts = { ...getLayout(name) as any, animate, animationDuration: animate ? 800 : 0, fit: true };
        const layout = cy.layout(opts);
        layout.run();
    }, [cy, animate]);

    return (
        <div className="flex items-center gap-1">
            {LAYOUTS.map(l => (
                <button
                    key={l.name}
                    onClick={() => applyLayout(l.name)}
                    title={l.desc}
                    className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                        active === l.name
                            ? 'border-cyan-700 text-cyan-400 bg-cyan-950/30'
                            : 'border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    {l.label}
                </button>
            ))}
        </div>
    );
}
