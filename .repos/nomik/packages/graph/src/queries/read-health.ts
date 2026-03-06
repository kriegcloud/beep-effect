import type { GraphDriver } from '../drivers/driver.interface.js';

// ────────────────────────────────────────────────────────────────────────
// Health queries: dead code, god objects, god files, duplicates
// Split from read.ts to reduce god file size
// ────────────────────────────────────────────────────────────────────────

/** Dead code detection — functions with no incoming calls.
 *  Excludes: constructors, class methods, React components, barrel re-exports,
 *  dunder methods, @property descriptors, test functions, registration decorators.
 */
export async function findDeadCode(driver: GraphDriver, projectId?: string): Promise<Array<{ name: string; filePath: string }>> {
    const projectFilter = projectId ? 'AND f.projectId = $projectId' : '';
    return driver.runQuery(
        `
    MATCH (f:Function)
    WHERE NOT (f)<-[:CALLS]-()
      AND NOT (f)<-[:HANDLES]-()
      AND NOT (f)<-[:DEPENDS_ON]-(:File)
      AND f.name <> 'constructor'
      ${projectFilter}
    WITH f
    // Exclude React components, markdown
    WHERE NOT f.filePath ENDS WITH '.tsx'
      AND NOT f.filePath ENDS WITH '.jsx'
      AND NOT f.filePath ENDS WITH '.md'
      AND NOT f.filePath ENDS WITH '.mdx'
    // Exclude Python dunder methods (__str__, __init__, __repr__, etc.)
      AND NOT (f.name STARTS WITH '__' AND f.name ENDS WITH '__')
    // Exclude Python test functions (test_*)
      AND NOT f.name STARTS WITH 'test_'
    // Exclude Python @property and decorator-invoked methods
      AND NOT (f.decorators IS NOT NULL AND (
          f.decorators CONTAINS 'property'
          OR f.decorators CONTAINS '.setter'
          OR f.decorators CONTAINS '.getter'
          OR f.decorators CONTAINS '.deleter'
          OR f.decorators CONTAINS 'receiver'
          OR f.decorators CONTAINS 'register'
          OR f.decorators CONTAINS 'task'
          OR f.decorators CONTAINS 'shared_task'
      ))
    OPTIONAL MATCH (parent:File)-[:CONTAINS]->(f)
    WITH f, parent
    WHERE parent IS NULL
       OR (NOT parent.path ENDS WITH 'index.ts'
           AND NOT parent.path ENDS WITH 'index.js')
    // Exclude class methods (called via obj.method(), not directly)
    WITH f, parent
    OPTIONAL MATCH (parent)-[:CONTAINS]->(cls:Class)
    WHERE cls.methods CONTAINS ('"' + f.name + '"')
    WITH f, parent, cls
    WHERE cls IS NULL
    // Exclude functions re-exported via barrel (index.ts/js imports parent file)
    OPTIONAL MATCH (barrel:File)-[:DEPENDS_ON|IMPORTS]->(parent)
    WHERE barrel IS NOT NULL
      AND (barrel.path ENDS WITH 'index.ts' OR barrel.path ENDS WITH 'index.js')
    WITH f, barrel
    WHERE barrel IS NULL
    RETURN f.name as name, f.filePath as filePath
    ORDER BY f.filePath
    `,
        { projectId },
    );
}

/** Detect god objects — only counts unexpected cross-file coupling
 *  Excludes: intra-file dispatch and calls to directly imported files (DEPENDS_ON)
 */
export async function findGodObjects(
    driver: GraphDriver,
    threshold: number = 15,
    projectId?: string,
): Promise<Array<{ name: string; filePath: string; depCount: number }>> {
    const projectFilter = projectId ? 'AND f.projectId = $projectId' : '';
    return driver.runQuery(
        `
    MATCH (f:Function)-[:CALLS]->(target)
    WHERE true ${projectFilter}
    MATCH (ff:File)-[:CONTAINS]->(f)
    WHERE NOT (ff)-[:CONTAINS]->(target)
    MATCH (tf:File)-[:CONTAINS]->(target)
    WHERE NOT (ff)-[:DEPENDS_ON]->(tf)
    WITH f, count(DISTINCT target) as depCount
    WHERE depCount > $threshold
    RETURN f.name as name, f.filePath as filePath, depCount
    ORDER BY depCount DESC
    `,
        { threshold, projectId },
    );
}

/** Detect god files — files with too many functions (responsibilities)
 *  Indicator of poor modularization: a file with >N functions is suspect
 */
export async function findGodFiles(
    driver: GraphDriver,
    threshold: number = 10,
    projectId?: string,
): Promise<Array<{ filePath: string; functionCount: number; totalLines: number }>> {
    const projectFilter = projectId ? 'AND f.projectId = $projectId' : '';
    return driver.runQuery(
        `
    MATCH (f:File)-[:CONTAINS]->(fn:Function)
    WHERE true ${projectFilter}
    WITH f, count(fn) as functionCount
    WHERE functionCount > $threshold
    RETURN f.path as filePath,
           functionCount,
           COALESCE(f.lineCount, 0) as totalLines
    ORDER BY functionCount DESC
    `,
        { threshold, projectId },
    );
}

/** Detect duplicate code — functions with the same bodyHash in different files
 *  Indicator of copy-paste: identical functions (after whitespace normalization)
 */
export async function findDuplicates(
    driver: GraphDriver,
    projectId?: string,
): Promise<Array<{ bodyHash: string; count: number; functions: Array<{ name: string; filePath: string }> }>> {
    const projectFilter = projectId ? 'AND f.projectId = $projectId' : '';
    return driver.runQuery(
        `
    MATCH (f:Function)
    WHERE f.bodyHash IS NOT NULL ${projectFilter}
      AND (f.endLine - f.startLine) >= 3
    WITH f.bodyHash as bodyHash, collect({name: f.name, filePath: f.filePath}) as funcs, count(*) as cnt
    WHERE cnt > 1
    RETURN bodyHash, cnt as count, funcs as functions
    ORDER BY cnt DESC
    LIMIT 50
    `,
        { projectId },
    );
}
