import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { discoverFiles } from '../discovery';

let tmpDir: string;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nomik-test-'));

    // Creer une arborescence de test
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'src', 'utils'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'node_modules', 'pkg'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'dist'), { recursive: true });

    fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), 'export {}');
    fs.writeFileSync(path.join(tmpDir, 'src', 'app.tsx'), '<App/>');
    fs.writeFileSync(path.join(tmpDir, 'src', 'utils', 'helper.ts'), 'export const x = 1');
    fs.writeFileSync(path.join(tmpDir, 'src', 'index.test.ts'), 'test()');
    fs.writeFileSync(path.join(tmpDir, 'node_modules', 'pkg', 'index.ts'), 'nm');
    fs.writeFileSync(path.join(tmpDir, 'dist', 'output.js'), 'dist');
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# README');
    fs.writeFileSync(path.join(tmpDir, 'src', 'types.d.ts'), 'declare module');
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('discoverFiles', () => {
    it('decouvre les fichiers TS/TSX dans src/', async () => {
        const files = await discoverFiles({
            root: tmpDir,
            include: ['**/*.ts', '**/*.tsx'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.ts'],
        });

        const basenames = files.map(f => path.basename(f));
        expect(basenames).toContain('index.ts');
        expect(basenames).toContain('app.tsx');
        expect(basenames).toContain('helper.ts');
    });

    it('exclut node_modules et dist', async () => {
        const files = await discoverFiles({
            root: tmpDir,
            include: ['**/*.ts', '**/*.tsx', '**/*.js'],
            exclude: ['**/node_modules/**', '**/dist/**'],
        });

        const joined = files.join('|');
        expect(joined).not.toContain('node_modules');
        expect(joined).not.toContain('dist');
    });

    it('exclut les fichiers .test.ts', async () => {
        const files = await discoverFiles({
            root: tmpDir,
            include: ['**/*.ts'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.ts'],
        });

        const basenames = files.map(f => path.basename(f));
        expect(basenames).not.toContain('index.test.ts');
        expect(basenames).not.toContain('types.d.ts');
    });

    it('decouvre les fichiers markdown si inclus', async () => {
        const files = await discoverFiles({
            root: tmpDir,
            include: ['**/*.md'],
            exclude: ['**/node_modules/**'],
        });

        const basenames = files.map(f => path.basename(f));
        expect(basenames).toContain('README.md');
    });

    it('lance une erreur si le root nexiste pas', async () => {
        await expect(
            discoverFiles({ root: '/nonexistent/path/xyz', include: ['**/*.ts'], exclude: [] }),
        ).rejects.toThrow('Target root does not exist');
    });

    it('retourne les chemins tries et absolus', async () => {
        const files = await discoverFiles({
            root: tmpDir,
            include: ['**/*.ts'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.d.ts'],
        });

        for (const f of files) {
            expect(path.isAbsolute(f)).toBe(true);
        }

        // Verifie le tri
        const sorted = [...files].sort();
        expect(files).toEqual(sorted);
    });
});
