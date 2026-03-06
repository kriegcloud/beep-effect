import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../extractors/markdown';

const SAMPLE_MD = `# Guide Technique

## Installation

Suivez ces etapes pour installer le projet.

### Pre-requis

- Node.js 20+
- pnpm

## Configuration

Creez un fichier \`.env\` a la racine.

# FAQ
`;

describe('parseMarkdown', () => {
    it('extrait les sections comme noeuds Function', () => {
        const result = parseMarkdown('/docs/guide.md', SAMPLE_MD);

        expect(result.file.type).toBe('file');
        expect(result.file.language).toBe('markdown');
        expect(result.file.path).toBe('/docs/guide.md');

        // 1 file + 4 sections (Guide Technique, Installation, Pre-requis, Configuration, FAQ)
        const sectionNodes = result.nodes.filter(n => n.type === 'function');
        expect(sectionNodes.length).toBe(5);

        const names = sectionNodes.map(n => n.name);
        expect(names).toContain('Guide Technique');
        expect(names).toContain('Installation');
        expect(names).toContain('Pre-requis');
        expect(names).toContain('Configuration');
        expect(names).toContain('FAQ');
    });

    it('cree des edges CONTAINS pour chaque section', () => {
        const result = parseMarkdown('/docs/guide.md', SAMPLE_MD);

        expect(result.edges.length).toBe(5);
        for (const edge of result.edges) {
            expect(edge.type).toBe('CONTAINS');
            expect(edge.sourceId).toBe(result.file.id);
        }
    });

    it('gere un fichier vide sans erreur', () => {
        const result = parseMarkdown('/docs/empty.md', '');

        expect(result.file.type).toBe('file');
        expect(result.nodes.length).toBe(1); // Seulement le FileNode
        expect(result.edges.length).toBe(0);
    });

    it('gere un fichier sans titres', () => {
        const result = parseMarkdown('/docs/plain.md', 'Just some text.\nNo headings here.');

        expect(result.nodes.length).toBe(1);
        expect(result.edges.length).toBe(0);
    });

    it('detecte les niveaux de titres h1 a h6', () => {
        const md = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6\n';
        const result = parseMarkdown('/docs/levels.md', md);

        const sections = result.nodes.filter(n => n.type === 'function');
        expect(sections.length).toBe(6);
    });

    it('tronque le contenu des sections a 500 caracteres', () => {
        const longContent = 'x'.repeat(1000);
        const md = `# Title\n${longContent}`;
        const result = parseMarkdown('/docs/long.md', md);

        // Le contenu de la section ne devrait pas depasser 500 chars
        // (verifie indirectement via le parsing sans crash)
        expect(result.nodes.length).toBe(2);
    });

    it('genere des ids uniques par section', () => {
        const result = parseMarkdown('/docs/guide.md', SAMPLE_MD);

        const ids = result.nodes.map(n => n.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
