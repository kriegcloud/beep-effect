import { describe, it, expect } from 'vitest';

/** Test the path exclusion regex (same logic as isExcludedPath in watcher.ts) */
function isExcludedPath(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, '/');
    return /\/node_modules\//.test(normalized)
        || /\/dist\//.test(normalized)
        || /\/\.git\//.test(normalized)
        || /\/docker\//.test(normalized);
}

describe('isExcludedPath', () => {
    it('exclut les chemins node_modules classiques', () => {
        expect(isExcludedPath('/project/node_modules/pkg/index.ts')).toBe(true);
    });

    it('exclut les symlinks pnpm dans node_modules', () => {
        expect(isExcludedPath('C:\\Users\\GP78HX\\Documents\\NOMIK\\node_modules\\.pnpm\\node_modules\\@nomik\\parser\\src\\parser.ts')).toBe(true);
    });

    it('exclut les node_modules imbriques dans packages/', () => {
        expect(isExcludedPath('C:\\Users\\GP78HX\\Documents\\NOMIK\\packages\\cli\\node_modules\\@nomik\\parser\\src\\parser.ts')).toBe(true);
    });

    it('exclut les chemins dist/', () => {
        expect(isExcludedPath('/project/dist/index.js')).toBe(true);
        expect(isExcludedPath('C:\\project\\packages\\core\\dist\\index.js')).toBe(true);
    });

    it('exclut les chemins .git/', () => {
        expect(isExcludedPath('/project/.git/objects/abc')).toBe(true);
    });

    it('exclut les chemins docker/', () => {
        expect(isExcludedPath('/project/docker/data/neo4j')).toBe(true);
    });

    it('accepte les fichiers source normaux', () => {
        expect(isExcludedPath('/project/src/index.ts')).toBe(false);
        expect(isExcludedPath('C:\\Users\\GP78HX\\Documents\\NOMIK\\packages\\parser\\src\\parser.ts')).toBe(false);
        expect(isExcludedPath('/project/packages/core/src/types.ts')).toBe(false);
    });

    it('accepte les fichiers markdown dans documentations/', () => {
        expect(isExcludedPath('/project/documentations/docs/README.md')).toBe(false);
    });

    it('gere les separateurs Windows et Unix', () => {
        expect(isExcludedPath('C:\\project\\node_modules\\pkg\\index.ts')).toBe(true);
        expect(isExcludedPath('C:/project/node_modules/pkg/index.ts')).toBe(true);
    });
});
