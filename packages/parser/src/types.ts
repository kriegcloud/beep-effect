import type { FileNode, GraphNode, GraphEdge } from '@nomik/core';
import type { ImportInfo } from './extractors/imports';
import type { ExportInfo } from './extractors/exports';
import type { CallInfo } from './extractors/calls';

export interface ParseResult {
    file: FileNode;
    nodes: GraphNode[];
    edges: GraphEdge[];
    imports: ImportInfo[];
    exports: ExportInfo[];
    calls: CallInfo[];
    arrayAliases: Record<string, string[]>;
}

export interface ParserEngine {
    parseFile(filePath: string): Promise<ParseResult>;
    parseFiles(filePaths: string[]): Promise<ParseResult[]>;
}
