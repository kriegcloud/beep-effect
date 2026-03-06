import type { GraphEdge } from '@nomik/core';

// ────────────────────────────────────────────────────────────────────────
// Test Coverage Correlation
//
// Analyzes test files to detect which functions/classes are tested.
// Heuristic: test('should do X', ...) or it('should do X', ...) blocks
// that call a function → TESTED_BY edge from the function to the test.
//
// Also detects:
//   - describe('ClassName', ...) blocks → class correlation
//   - import { fn } from '../module' → tested module detection
//   - jest.mock('../module') → mocked module detection
//
// Returns: edges to be resolved cross-file during batch resolution
// ────────────────────────────────────────────────────────────────────────

export interface TestFileInfo {
    filePath: string;
    isTestFile: boolean;
    testedModules: string[];    // import sources from ../... or @/...
    mockedModules: string[];    // jest.mock('...') targets
    describeBlocks: string[];   // describe('Name', ...) block names
    testCount: number;          // number of it/test blocks
}

// Patterns that identify a file as a test file
const TEST_FILE_PATTERNS = [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /__tests__\//,
    /\/test\//,
    /\.test$/,
];

export function isTestFile(filePath: string): boolean {
    return TEST_FILE_PATTERNS.some(p => p.test(filePath));
}

export function extractTestFileInfo(content: string, filePath: string): TestFileInfo {
    const info: TestFileInfo = {
        filePath,
        isTestFile: isTestFile(filePath),
        testedModules: [],
        mockedModules: [],
        describeBlocks: [],
        testCount: 0,
    };

    if (!info.isTestFile) return info;

    // Extract relative imports (tested modules)
    const importRegex = /import\s+.*?from\s+['"](\.\.[^'"]+|\.\/[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        info.testedModules.push(match[1]!);
    }

    // Extract jest.mock targets
    const mockRegex = /jest\.mock\(\s*['"]([^'"]+)['"]/g;
    while ((match = mockRegex.exec(content)) !== null) {
        info.mockedModules.push(match[1]!);
    }

    // Extract vi.mock targets (vitest)
    const viMockRegex = /vi\.mock\(\s*['"]([^'"]+)['"]/g;
    while ((match = viMockRegex.exec(content)) !== null) {
        info.mockedModules.push(match[1]!);
    }

    // Extract describe block names
    const describeRegex = /describe\(\s*['"]([^'"]+)['"]/g;
    while ((match = describeRegex.exec(content)) !== null) {
        info.describeBlocks.push(match[1]!);
    }

    // Count test blocks
    const testRegex = /(?:^|\s)(?:it|test)\s*\(/gm;
    while (testRegex.exec(content) !== null) {
        info.testCount++;
    }

    return info;
}

export function buildTestCoverageEdges(
    testInfos: TestFileInfo[],
    filePathToId: Map<string, string>,
    resolveImportPath: (fromPath: string, importSource: string) => string | null,
): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    for (const info of testInfos) {
        if (!info.isTestFile || info.testedModules.length === 0) continue;

        const testFileId = filePathToId.get(info.filePath);
        if (!testFileId) continue;

        for (const mod of info.testedModules) {
            // Skip mocked modules — they're not truly tested
            if (info.mockedModules.includes(mod)) continue;

            const resolvedId = resolveImportPath(info.filePath, mod);
            if (!resolvedId) continue;

            const edgeId = `${resolvedId}->depends_on->${testFileId}`;
            if (seen.has(edgeId)) continue;
            seen.add(edgeId);

            edges.push({
                id: edgeId,
                type: 'DEPENDS_ON' as const,
                sourceId: resolvedId,
                targetId: testFileId,
                confidence: 0.8,
                kind: 'test' as const,
            });
        }
    }

    return edges;
}

export function getTestSummary(
    testInfos: TestFileInfo[],
): { totalTests: number; testedModules: number; mockedModules: number } {
    let totalTests = 0;
    let testedModules = 0;
    let mockedModules = 0;

    for (const info of testInfos) {
        totalTests += info.testCount;
        testedModules += info.testedModules.length;
        mockedModules += info.mockedModules.length;
    }

    return { totalTests, testedModules, mockedModules };
}
