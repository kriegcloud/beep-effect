/** Available graph layouts */

export type LayoutName = 'cose' | 'breadthfirst' | 'concentric' | 'circle';

/** Force-directed: nodes repel, edges attract */
export const coseLayout = {
    name: 'cose' as const,
    animate: false,              // Pre-compute positions, no visible organizing
    nodeRepulsion: (_node: any) => 12000,
    idealEdgeLength: (_edge: any) => 50,
    edgeElasticity: (_edge: any) => 100,
    nestingFactor: 1.2,
    gravity: 1.5,
    numIter: 2000,
    initialTemp: 400,
    coolingFactor: 0.97,
    minTemp: 1.0,
    randomize: true,
    componentSpacing: 60,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 40,
};

/** Hierarchical: shows depth (File → Function/Class) */
export const breadthfirstLayout = {
    name: 'breadthfirst' as const,
    animate: false,
    directed: true,
    spacingFactor: 1.2,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 40,
    circle: false,
    grid: false,
    maximal: false,
};

/** Concentric: most connected nodes at center */
export const concentricLayout = {
    name: 'concentric' as const,
    animate: false,
    concentric: (node: any) => node.degree(),
    levelWidth: () => 3,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 40,
    minNodeSpacing: 30,
};

/** Circular: all nodes in a circle */
export const circleLayout = {
    name: 'circle' as const,
    animate: false,
    avoidOverlap: true,
    nodeDimensionsIncludeLabels: true,
    fit: true,
    padding: 40,
};

/** Returns layout by name */
export function getLayout(name: LayoutName) {
    switch (name) {
        case 'breadthfirst': return breadthfirstLayout;
        case 'concentric': return concentricLayout;
        case 'circle': return circleLayout;
        default: return coseLayout;
    }
}

/** Fast layout for large graphs (>300 elements) — fewer iterations, faster convergence */
export const fastCoseLayout = {
    name: 'cose' as const,
    animate: false,              // Pre-compute positions, no visible organizing
    nodeRepulsion: (_node: any) => 8000,
    idealEdgeLength: (_edge: any) => 80,
    edgeElasticity: (_edge: any) => 100,
    nestingFactor: 1.2,
    gravity: 2.0,
    numIter: 300,       // 2000 → 300 — huge CPU savings
    initialTemp: 300,
    coolingFactor: 0.99,
    minTemp: 2.0,
    randomize: true,
    componentSpacing: 80,
    nodeDimensionsIncludeLabels: false,  // Skip label measurement
    fit: true,
    padding: 30,
};

/** Returns appropriate layout based on element count */
export function getAdaptiveLayout(elementCount: number) {
    if (elementCount > 300) return fastCoseLayout;
    return coseLayout;
}

/** Default export (backward-compatible) */
export const graphLayout = coseLayout;
