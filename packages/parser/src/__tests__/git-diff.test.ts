import { describe, it, expect } from 'vitest';
import { getGitDiff, findChangedFunctions, type FunctionLineRange } from '../git-diff';
import { execSync } from 'node:child_process';

describe('git-diff', () => {
    describe('getGitDiff — direct mode (--since)', () => {
        it('returns changes when diffing against HEAD~1 with direct=true', () => {
            // Skip if repo has < 2 commits
            let commitCount: number;
            try {
                commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
            } catch {
                return; // Not a git repo, skip
            }
            if (commitCount < 2) return;

            const result = getGitDiff('HEAD~1', undefined, true);
            expect(result.totalChangedFiles).toBeGreaterThan(0);
            expect(result.files.length).toBe(result.totalChangedFiles);
            // Every file should have a valid status
            for (const f of result.files) {
                expect(['added', 'modified', 'deleted', 'renamed']).toContain(f.status);
            }
        });

        it('direct=true produces same result as direct=false for HEAD~1 (linear history)', () => {
            let commitCount: number;
            try {
                commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);
            } catch {
                return;
            }
            if (commitCount < 2) return;

            // On a linear history, merge-base(HEAD~1, HEAD) === HEAD~1, so both should be identical
            const direct = getGitDiff('HEAD~1', undefined, true);
            const viaMergeBase = getGitDiff('HEAD~1', undefined, false);
            expect(direct.totalChangedFiles).toBe(viaMergeBase.totalChangedFiles);
            expect(direct.files.map(f => f.filePath).sort()).toEqual(viaMergeBase.files.map(f => f.filePath).sort());
        });

        it('returns baseBranch reflecting the ref passed in', () => {
            // Use a commit SHA to verify baseBranch is set correctly
            let sha: string;
            try {
                sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
            } catch {
                return;
            }
            const result = getGitDiff(sha, undefined, true);
            expect(result.baseBranch).toBe(sha);
        });
    });

    describe('findChangedFunctions', () => {
        const functions: FunctionLineRange[] = [
            { name: 'foo', id: 'id-foo', startLine: 1, endLine: 10 },
            { name: 'bar', id: 'id-bar', startLine: 15, endLine: 30 },
            { name: 'baz', id: 'id-baz', startLine: 35, endLine: 50 },
        ];

        it('returns functions whose line ranges overlap changed lines', () => {
            const result = findChangedFunctions([5, 20], functions);
            expect(result.map(f => f.name).sort()).toEqual(['bar', 'foo']);
        });

        it('returns empty when no overlap', () => {
            const result = findChangedFunctions([11, 12, 13], functions);
            expect(result).toHaveLength(0);
        });

        it('returns empty for empty changed lines', () => {
            const result = findChangedFunctions([], functions);
            expect(result).toHaveLength(0);
        });

        it('returns empty for empty functions', () => {
            const result = findChangedFunctions([5], []);
            expect(result).toHaveLength(0);
        });

        it('detects change at exact boundary (startLine)', () => {
            const result = findChangedFunctions([15], functions);
            expect(result).toHaveLength(1);
            expect(result[0]!.name).toBe('bar');
        });

        it('detects change at exact boundary (endLine)', () => {
            const result = findChangedFunctions([50], functions);
            expect(result).toHaveLength(1);
            expect(result[0]!.name).toBe('baz');
        });

        it('returns all functions when all lines changed', () => {
            const allLines = Array.from({ length: 50 }, (_, i) => i + 1);
            const result = findChangedFunctions(allLines, functions);
            expect(result).toHaveLength(3);
        });
    });
});
