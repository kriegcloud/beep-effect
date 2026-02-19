# effect/Graph Surface

Total exports: 80

| Export | Kind | Overview |
|---|---|---|
| `addEdge` | `const` | Adds a new edge to a mutable graph and returns its index. |
| `addNode` | `const` | Adds a new node to a mutable graph and returns its index. |
| `AllPairsResult` | `interface` | Result of all-pairs shortest path computation. |
| `astar` | `const` | Find the shortest path between two nodes using A* pathfinding algorithm. |
| `AstarConfig` | `interface` | Configuration for A* pathfinding algorithm. |
| `beginMutation` | `const` | Creates a mutable scope for safe graph mutations by copying the data structure. |
| `bellmanFord` | `const` | Find the shortest path between two nodes using Bellman-Ford algorithm. |
| `BellmanFordConfig` | `interface` | Configuration for Bellman-Ford algorithm. |
| `bfs` | `const` | Creates a new BFS iterator with optional configuration. |
| `connectedComponents` | `const` | Find connected components in an undirected graph. Each component is represented as an array of node indices. |
| `dfs` | `const` | Creates a new DFS iterator with optional configuration. |
| `dfsPostOrder` | `const` | Creates a new DFS postorder iterator with optional configuration. |
| `dijkstra` | `const` | Find the shortest path between two nodes using Dijkstra's algorithm. |
| `DijkstraConfig` | `interface` | Configuration for Dijkstra's algorithm. |
| `directed` | `const` | Creates a directed graph, optionally with initial mutations. |
| `DirectedGraph` | `type` | Directed graph type alias. |
| `Direction` | `type` | Direction for graph traversal, indicating which edges to follow. |
| `Edge` | `class` | Edge data containing source, target, and user data. |
| `edgeCount` | `const` | Returns the number of edges in the graph. |
| `EdgeIndex` | `type` | Edge index for edge identification using plain numbers. |
| `edges` | `const` | Creates an iterator over all edge indices in the graph. |
| `EdgeWalker` | `type` | Type alias for edge iteration using Walker. EdgeWalker is represented as Walker<EdgeIndex, Edge<E>>. |
| `endMutation` | `const` | Converts a mutable graph back to an immutable graph, ending the mutation scope. |
| `entries` | `const` | Returns an iterator over [index, data] entries in the walker. |
| `externals` | `const` | Creates an iterator over external nodes (nodes without edges in specified direction). |
| `ExternalsConfig` | `interface` | Configuration for externals iterator. |
| `filterEdges` | `const` | Filters edges by removing those that don't match the predicate. This function modifies the mutable graph in place. |
| `filterMapEdges` | `const` | Filters and optionally transforms edges in a mutable graph using a predicate function. Edges that return Option.none are removed from the graph. |
| `filterMapNodes` | `const` | Filters and optionally transforms nodes in a mutable graph using a predicate function. Nodes that return Option.none are removed along with all their connected edges. |
| `filterNodes` | `const` | Filters nodes by removing those that don't match the predicate. This function modifies the mutable graph in place. |
| `findEdge` | `const` | Finds the first edge that matches the given predicate. |
| `findEdges` | `const` | Finds all edges that match the given predicate. |
| `findNode` | `const` | Finds the first node that matches the given predicate. |
| `findNodes` | `const` | Finds all nodes that match the given predicate. |
| `floydWarshall` | `const` | Find shortest paths between all pairs of nodes using Floyd-Warshall algorithm. |
| `getEdge` | `const` | Gets the edge data associated with an edge index, if it exists. |
| `getNode` | `const` | Gets the data associated with a node index, if it exists. |
| `Graph` | `interface` | Immutable graph interface. |
| `GraphError` | `class` | No summary found in JSDoc. |
| `GraphVizOptions` | `interface` | Configuration options for GraphViz DOT format generation from graphs. |
| `hasEdge` | `const` | Checks if an edge exists between two nodes in the graph. |
| `hasNode` | `const` | Checks if a node with the given index exists in the graph. |
| `indices` | `const` | Returns an iterator over the indices in the walker. |
| `isAcyclic` | `const` | Checks if the graph is acyclic (contains no cycles). |
| `isBipartite` | `const` | Checks if an undirected graph is bipartite. |
| `isGraph` | `const` | No summary found in JSDoc. |
| `Kind` | `type` | Graph type for distinguishing directed and undirected graphs. |
| `mapEdges` | `const` | Transforms all edge data in a mutable graph using the provided mapping function. |
| `mapNodes` | `const` | Creates a new graph with transformed node data using the provided mapping function. |
| `MermaidDiagramType` | `type` | Mermaid diagram types for different visualization formats. |
| `MermaidDirection` | `type` | Mermaid diagram direction types for controlling layout orientation. |
| `MermaidNodeShape` | `type` | Mermaid node shape types for diagram visualization. |
| `MermaidOptions` | `interface` | Configuration options for Mermaid diagram generation from graphs. |
| `MutableDirectedGraph` | `type` | Mutable directed graph type alias. |
| `MutableGraph` | `interface` | Mutable graph interface. |
| `MutableUndirectedGraph` | `type` | Mutable undirected graph type alias. |
| `mutate` | `const` | Performs scoped mutations on a graph, automatically managing the mutation lifecycle. |
| `neighbors` | `const` | Returns the neighboring nodes (targets of outgoing edges) for a given node. |
| `neighborsDirected` | `const` | Get neighbors of a node in a specific direction for bidirectional traversal. |
| `nodeCount` | `const` | Returns the number of nodes in the graph. |
| `NodeIndex` | `type` | Node index for node identification using plain numbers. |
| `nodes` | `const` | Creates an iterator over all node indices in the graph. |
| `NodeWalker` | `type` | Type alias for node iteration using Walker. NodeWalker is represented as Walker<NodeIndex, N>. |
| `PathResult` | `interface` | Result of a shortest path computation containing the path and total distance. |
| `Proto` | `interface` | Graph prototype interface. |
| `removeEdge` | `const` | Removes an edge from a mutable graph. |
| `removeNode` | `const` | Removes a node and all its incident edges from a mutable graph. |
| `reverse` | `const` | Reverses all edge directions in a mutable graph by swapping source and target nodes. |
| `SearchConfig` | `interface` | Configuration options for search iterators. |
| `stronglyConnectedComponents` | `const` | Find strongly connected components in a directed graph using Kosaraju's algorithm. Each SCC is represented as an array of node indices. |
| `toGraphViz` | `const` | Exports a graph to GraphViz DOT format for visualization. |
| `toMermaid` | `const` | Exports a graph to Mermaid diagram format for visualization. |
| `topo` | `const` | Creates a new topological sort iterator with optional configuration. |
| `TopoConfig` | `interface` | Configuration options for topological sort iterator. |
| `undirected` | `const` | Creates an undirected graph, optionally with initial mutations. |
| `UndirectedGraph` | `type` | Undirected graph type alias. |
| `updateEdge` | `const` | Updates a single edge's data by applying a transformation function. |
| `updateNode` | `const` | Updates a single node's data by applying a transformation function. |
| `values` | `const` | Returns an iterator over the values (data) in the walker. |
| `Walker` | `class` | Concrete class for iterables that produce [NodeIndex, NodeData] tuples. |
