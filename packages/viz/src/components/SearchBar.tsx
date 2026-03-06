import { useState, useCallback, useEffect } from 'react';
import type cytoscape from 'cytoscape';

type SearchMode = 'focus' | 'fit';

interface SearchBarProps {
    cy: cytoscape.Core | null;
}

/** Search bar to find and focus a node */
export function SearchBar({ cy }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<SearchMode>('focus');
    const [matchIds, setMatchIds] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    const clearSearchClasses = useCallback(() => {
        if (!cy) return;
        cy.elements().removeClass('search-match search-focus search-edge faded');
    }, [cy]);

    const focusMatch = useCallback((ids: string[], index: number, animate = true) => {
        if (!cy || ids.length === 0) return;

        const safeIndex = ((index % ids.length) + ids.length) % ids.length;
        const targetId = ids[safeIndex]!;
        const target = cy.getElementById(targetId);
        if (!target.length) return;

        cy.nodes().removeClass('search-focus');
        if (mode === 'focus') cy.edges().removeClass('search-edge');
        target.removeClass('faded').addClass('search-focus');

        if (mode === 'fit' && ids.length > 1) {
            let allMatches = cy.collection();
            for (const id of ids) {
                const node = cy.getElementById(id);
                if (node.length) allMatches = allMatches.union(node);
            }
            allMatches.connectedEdges().removeClass('faded').addClass('search-edge');
            allMatches.neighborhood().nodes().removeClass('faded');
            cy.animate({ fit: { eles: allMatches, padding: 90 }, duration: animate ? 400 : 0 });
        } else {
            const label = String(target.data('label') ?? '');
            const minFocusZoom = label === 'File' ? 1.1 : 1.4;
            const nextZoom = Math.min(cy.maxZoom(), Math.max(cy.zoom(), minFocusZoom));
            target.neighborhood().nodes().removeClass('faded');
            target.connectedEdges().removeClass('faded').addClass('search-edge');
            cy.animate({
                center: { eles: target },
                zoom: nextZoom,
                duration: animate ? 260 : 0,
            });
        }

        setActiveIndex(safeIndex);
    }, [cy, mode]);

    const handleSearch = useCallback(() => {
        if (!cy || !query.trim()) {
            clearSearchClasses();
            setMatchIds([]);
            setActiveIndex(0);
            setHasSearched(false);
            return;
        }

        const q = query.toLowerCase();
        setHasSearched(true);
        clearSearchClasses();

        const ranked = cy.nodes().toArray().map((n) => {
            const name = (n.data('name') ?? '').toLowerCase();
            const filePath = String(n.data('filePath') ?? n.data('path') ?? '').toLowerCase().replace(/\\/g, '/');
            let score = 0;

            if (name === q) score = 120;
            else if (name.startsWith(q)) score = 100;
            else if (name.includes(q)) score = 80;
            else if (filePath.endsWith(`/${q}`) || filePath.includes(`/${q}.`)) score = 60;
            else if (filePath.includes(q)) score = 40;

            return { node: n, score, name };
        }).filter(x => x.score > 0).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.name.localeCompare(b.name);
        });

        const ids = ranked.map(r => r.node.id());
        setMatchIds(ids);
        setActiveIndex(0);

        if (ids.length === 0) return;

        cy.elements().addClass('faded');

        let matches = cy.collection();
        for (const id of ids) {
            const node = cy.getElementById(id);
            if (node.length) matches = matches.union(node);
        }

        matches.removeClass('faded').addClass('search-match');

        if (mode === 'fit') {
            matches.connectedEdges().removeClass('faded').addClass('search-edge');
            matches.neighborhood().nodes().removeClass('faded');
        }

        focusMatch(ids, 0, true);
    }, [cy, query, mode, clearSearchClasses, focusMatch]);

    useEffect(() => {
        if (!hasSearched || !matchIds.length) return;
        focusMatch(matchIds, activeIndex, false);
    }, [mode, hasSearched, matchIds, activeIndex, focusMatch]);

    const handlePrev = useCallback(() => {
        if (!matchIds.length) return;
        focusMatch(matchIds, activeIndex - 1, true);
    }, [matchIds, activeIndex, focusMatch]);

    const handleNext = useCallback(() => {
        if (!matchIds.length) return;
        focusMatch(matchIds, activeIndex + 1, true);
    }, [matchIds, activeIndex, focusMatch]);

    const handleClear = useCallback(() => {
        setQuery('');
        setMatchIds([]);
        setActiveIndex(0);
        setHasSearched(false);
        clearSearchClasses();
    }, [clearSearchClasses]);

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search nodes..."
                className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded px-3 py-1.5 w-56 font-mono placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 bg-slate-900 rounded border border-slate-700 p-0.5">
                <button
                    onClick={() => setMode('focus')}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${mode === 'focus' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                    title="Focus result-by-result (no zoom out)"
                >
                    Focus
                </button>
                <button
                    onClick={() => setMode('fit')}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${mode === 'fit' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'text-slate-500 border border-transparent hover:text-slate-300'}`}
                    title="Fit all matches"
                >
                    Fit All
                </button>
            </div>
            <button onClick={handleSearch} className="px-3 py-1.5 bg-cyan-900/50 border border-cyan-700/50 text-cyan-300 text-sm rounded hover:bg-cyan-800/50 font-mono">
                Find
            </button>
            {matchIds.length > 1 && (
                <>
                    <button onClick={handlePrev} className="px-2 py-1.5 text-slate-400 text-sm border border-slate-700 rounded hover:text-slate-200 font-mono" title="Previous match">
                        Prev
                    </button>
                    <button onClick={handleNext} className="px-2 py-1.5 text-slate-400 text-sm border border-slate-700 rounded hover:text-slate-200 font-mono" title="Next match">
                        Next
                    </button>
                </>
            )}
            {hasSearched && (
                <span className="text-[10px] font-mono text-slate-500 min-w-[52px] text-center">
                    {matchIds.length === 0 ? '0 match' : `${activeIndex + 1}/${matchIds.length}`}
                </span>
            )}
            {query && (
                <button onClick={handleClear} className="px-2 py-1.5 text-slate-500 text-sm hover:text-slate-300 font-mono">
                    Clear
                </button>
            )}
        </div>
    );
}
