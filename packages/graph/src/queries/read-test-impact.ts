import type { GraphDriver } from '../drivers/driver.interface.js';

export interface TestImpactResult {
    changedSymbol: string;
    affectedTests: Array<{
        testFile: string;
        reason: string;
        depth: number;
    }>;
    totalTestFiles: number;
}

/**
 * Given a changed symbol name, trace the knowledge graph to find test files
 * that directly or transitively depend on it.
 *
 * Strategy:
 * 1. Find the symbol node
 * 2. Find all callers/dependents up to `maxDepth`
 * 3. Filter results to files that match test patterns (.test., .spec., __tests__)
 */
export async function findTestImpact(
    driver: GraphDriver,
    symbolName: string,
    maxDepth: number = 4,
    projectId?: string,
): Promise<TestImpactResult> {
    const pf = projectId ? '{projectId: $projectId}' : '';

    // Find test files that transitively depend on the changed symbol
    const affectedTests = await driver.runQuery<{
        testFile: string;
        reason: string;
        depth: number;
    }>(
        `
        MATCH (target ${pf})
        WHERE target.name = $symbolName
          AND (target:Function OR target:Class OR target:Variable OR target:Module)
        WITH target LIMIT 1

        // Traverse callers and dependents up to maxDepth
        MATCH path = (source)-[:CALLS|DEPENDS_ON|CONTAINS*1..${maxDepth}]->(target)
        WHERE source:File OR source:Function

        // Get the file that contains the source
        WITH source, target, length(path) as depth
        OPTIONAL MATCH (f:File)-[:CONTAINS]->(source)
        WITH COALESCE(f.path, source.path, source.filePath) as filePath, depth, target
        WHERE filePath IS NOT NULL
          AND (filePath CONTAINS '.test.' OR filePath CONTAINS '.spec.'
               OR filePath CONTAINS '__tests__' OR filePath CONTAINS '__test__'
               OR filePath CONTAINS '.tests.' OR filePath CONTAINS '.specs.')

        RETURN DISTINCT filePath as testFile,
               'transitive dependency (depth ' + toString(depth) + ')' as reason,
               depth
        ORDER BY depth, testFile
        LIMIT 100
        `,
        { symbolName, projectId },
    );

    // Also find test files that directly import the file containing the symbol
    const directTests = await driver.runQuery<{
        testFile: string;
        reason: string;
        depth: number;
    }>(
        `
        MATCH (target ${pf})
        WHERE target.name = $symbolName
          AND (target:Function OR target:Class OR target:Variable OR target:Module)
        WITH target LIMIT 1

        // Get the file containing the target
        MATCH (targetFile:File)-[:CONTAINS]->(target)

        // Find test files that import this file
        MATCH (testFile:File)-[:DEPENDS_ON]->(targetFile)
        WHERE testFile.path CONTAINS '.test.' OR testFile.path CONTAINS '.spec.'
              OR testFile.path CONTAINS '__tests__' OR testFile.path CONTAINS '__test__'

        RETURN DISTINCT testFile.path as testFile,
               'directly imports file containing ' + $symbolName as reason,
               1 as depth
        ORDER BY testFile.path
        LIMIT 50
        `,
        { symbolName, projectId },
    );

    // Merge and deduplicate
    const seen = new Set<string>();
    const merged: Array<{ testFile: string; reason: string; depth: number }> = [];

    for (const t of [...directTests, ...affectedTests]) {
        if (!seen.has(t.testFile)) {
            seen.add(t.testFile);
            merged.push(t);
        }
    }

    return {
        changedSymbol: symbolName,
        affectedTests: merged,
        totalTestFiles: merged.length,
    };
}

/**
 * Given a list of changed file paths, find all test files that should be re-run.
 */
export async function findTestImpactForFiles(
    driver: GraphDriver,
    filePaths: string[],
    projectId?: string,
): Promise<Array<{ testFile: string; changedFile: string; reason: string }>> {
    if (filePaths.length === 0) return [];

    const results = await driver.runQuery<{
        testFile: string;
        changedFile: string;
        reason: string;
    }>(
        `
        UNWIND $filePaths as changedPath
        MATCH (changed:File)
        WHERE changed.path = changedPath ${projectId ? 'AND changed.projectId = $projectId' : ''}

        // Find test files that depend on changed files (direct or via one intermediate)
        MATCH (testFile:File)-[:DEPENDS_ON*1..2]->(changed)
        WHERE testFile.path CONTAINS '.test.' OR testFile.path CONTAINS '.spec.'
              OR testFile.path CONTAINS '__tests__' OR testFile.path CONTAINS '__test__'

        RETURN DISTINCT testFile.path as testFile,
               changed.path as changedFile,
               'imports changed file' as reason
        ORDER BY testFile.path
        LIMIT 200
        `,
        { filePaths, projectId },
    );

    // Also include changed files that are themselves test files
    const selfTests = filePaths.filter(
        fp => fp.includes('.test.') || fp.includes('.spec.') || fp.includes('__tests__') || fp.includes('__test__'),
    ).map(fp => ({ testFile: fp, changedFile: fp, reason: 'test file itself was changed' }));

    const seen = new Set<string>();
    const merged: Array<{ testFile: string; changedFile: string; reason: string }> = [];

    for (const t of [...selfTests, ...results]) {
        if (!seen.has(t.testFile)) {
            seen.add(t.testFile);
            merged.push(t);
        }
    }

    return merged;
}
