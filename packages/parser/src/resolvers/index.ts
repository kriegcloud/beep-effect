// Intra-file resolution
export {
    resolveCallEdges,
    resolveFileCallEdges,
    resolveVariableArrayReferenceEdges,
    resolveVariableDeclarationAliasEdges,
} from './intra-file.js';

// Cross-file resolution
export {
    resolveCrossFileCallEdges,
    resolveFileCrossFileCallEdges,
    filterMethodCandidatesByReceiverImport,
    buildImportedAliasFunctionIds,
    buildImportedReceiverFileIds,
    resolveImportedSymbolReferenceEdges,
    resolveImportedArrayAliasCallEdges,
} from './cross-file.js';

// Route handling, type resolution, framework entry
export {
    resolveExtendsEdges,
    resolveImplementsEdges,
    resolveRouteHandlesEdges,
    resolveCrossFileHandlesEdges,
    extractHandlerMethodName,
    resolveFrameworkEntryEdges,
} from './route-handling.js';
