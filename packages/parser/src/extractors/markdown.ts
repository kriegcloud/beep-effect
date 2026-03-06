import type { FunctionNode, GraphEdge } from '@nomik/core';
import { createNodeId, createFileHash } from '../utils';
import type { FileNode, GraphNode } from '@nomik/core';

export interface MarkdownSection {
    id: string;
    name: string;
    level: number;
    line: number;
    content: string;
}

/** Parse a markdown file and extract sections as nodes */
export function parseMarkdown(filePath: string, content: string): {
    file: FileNode;
    nodes: GraphNode[];
    edges: GraphEdge[];
} {
    const hash = createFileHash(content);
    const fileNode: FileNode = {
        id: createNodeId('file', filePath, ''),
        type: 'file',
        path: filePath,
        language: 'markdown',
        hash,
        size: Buffer.byteLength(content, 'utf-8'),
        lineCount: content.split('\n').length,
        lastParsed: new Date().toISOString(),
    };

    const lines = content.split('\n');
    const sections: MarkdownSection[] = [];

    for (let i = 0; i < lines.length; i++) {
        const match = lines[i]!.match(/^(#{1,6})\s+(.+)$/);
        if (match && match[1] && match[2]) {
            const level = match[1].length;
            const name = match[2].trim();

            let sectionContent = '';
            for (let j = i + 1; j < lines.length; j++) {
                if (/^#{1,6}\s+/.test(lines[j]!)) break;
                sectionContent += lines[j] + '\n';
            }

            sections.push({
                id: createNodeId('function', filePath, name),
                name,
                level,
                line: i + 1,
                content: sectionContent.trim().substring(0, 500),
            });
        }
    }

    const sectionNodes: FunctionNode[] = sections.map(s => ({
        id: s.id,
        type: 'function' as const,
        name: s.name,
        filePath,
        startLine: s.line,
        endLine: s.line,
        params: [],
        isAsync: false,
        isExported: false,
        isGenerator: false,
        decorators: [],
        confidence: 1.0,
    }));

    const containsEdges: GraphEdge[] = sectionNodes.map(n => ({
        id: `${fileNode.id}->contains->${n.id}`,
        type: 'CONTAINS' as const,
        sourceId: fileNode.id,
        targetId: n.id,
        confidence: 1.0,
    }));

    return {
        file: fileNode,
        nodes: [fileNode, ...sectionNodes],
        edges: containsEdges,
    };
}
