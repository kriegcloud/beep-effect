import type { GraphDriver } from '../drivers/driver.interface.js';

// ── Rule definitions ────────────────────────────────────────────────

export type RuleSeverity = 'error' | 'warning' | 'info';

export interface RuleViolation {
    rule: string;
    severity: RuleSeverity;
    message: string;
    node?: string;
    filePath?: string;
    detail?: string;
}

export interface RuleResult {
    rule: string;
    severity: RuleSeverity;
    description: string;
    passed: boolean;
    violations: RuleViolation[];
}

export interface CustomRule {
    name: string;
    description?: string;
    severity?: RuleSeverity;
    cypher: string;
    maxResults?: number;
}

export interface RulesConfig {
    maxDeadCode?: number;
    maxGodFiles?: number;
    maxGodFileThreshold?: number;
    maxDuplicates?: number;
    maxFunctionCallers?: number;
    maxDbWritesPerRoute?: number;
    noCircularImports?: boolean;
    maxFunctionLines?: number;
    maxFileLines?: number;
    requireEnvVarDefaults?: boolean;
    maxSecurityIssues?: number;
    customRules?: CustomRule[];
}

const DEFAULT_RULES: Required<RulesConfig> = {
    maxDeadCode: 5,
    maxGodFiles: 3,
    maxGodFileThreshold: 15,
    maxDuplicates: 2,
    maxFunctionCallers: 50,
    maxDbWritesPerRoute: 3,
    noCircularImports: true,
    maxFunctionLines: 200,
    maxFileLines: 1000,
    requireEnvVarDefaults: false,
    maxSecurityIssues: 0,
    customRules: [],
};

// ── Rule evaluation ─────────────────────────────────────────────────

export async function evaluateRules(
    driver: GraphDriver,
    config: RulesConfig = {},
    projectId?: string,
): Promise<{ passed: boolean; results: RuleResult[]; summary: { errors: number; warnings: number; info: number } }> {
    const rules = { ...DEFAULT_RULES, ...config };
    const pf = projectId ? '{projectId: $projectId}' : '';
    const results: RuleResult[] = [];

    // Rule 1: Dead code limit
    const deadCode = await driver.runQuery<{ name: string; filePath: string }>(
        `MATCH (f:Function ${pf})
         WHERE NOT EXISTS { MATCH ()-[:CALLS]->(f) }
           AND NOT EXISTS { MATCH ()-[:HANDLES]->(f) }
           AND NOT EXISTS { MATCH (:File)-[:DEPENDS_ON]->(f) }
           AND NOT f.filePath ENDS WITH '.tsx'
           AND NOT f.filePath ENDS WITH '.jsx'
           AND NOT f.name = 'constructor'
           AND NOT (f.isExported = true AND EXISTS { MATCH (f)<-[:CONTAINS]-(:File)-[:DEPENDS_ON]->(:File) })
           AND NOT (f.name STARTS WITH '__' AND f.name ENDS WITH '__')
           AND NOT f.name STARTS WITH 'test_'
           AND NOT (f.decorators IS NOT NULL AND (
               f.decorators CONTAINS 'property'
               OR f.decorators CONTAINS '.setter'
               OR f.decorators CONTAINS 'receiver'
               OR f.decorators CONTAINS 'register'
               OR f.decorators CONTAINS 'task'
               OR f.decorators CONTAINS 'shared_task'
           ))
         RETURN f.name as name, f.filePath as filePath
         LIMIT 100`,
        { projectId },
    );
    results.push({
        rule: 'max-dead-code',
        severity: 'error',
        description: `Dead code count must be <= ${rules.maxDeadCode}`,
        passed: deadCode.length <= rules.maxDeadCode,
        violations: deadCode.slice(0, 20).map(d => ({
            rule: 'max-dead-code',
            severity: 'error' as RuleSeverity,
            message: `Dead function: ${d.name}`,
            node: d.name,
            filePath: d.filePath,
        })),
    });

    // Rule 2: God files limit
    const godFiles = await driver.runQuery<{ filePath: string; fnCount: number; totalLines: number }>(
        `MATCH (f:File ${pf})-[:CONTAINS]->(fn:Function)
         WITH f, count(fn) as fnCount
         WHERE fnCount > $threshold
         RETURN f.path as filePath, fnCount, COALESCE(f.lineCount, 0) as totalLines
         ORDER BY fnCount DESC LIMIT 50`,
        { projectId, threshold: rules.maxGodFileThreshold },
    );
    results.push({
        rule: 'max-god-files',
        severity: 'error',
        description: `God files (>${rules.maxGodFileThreshold} functions) must be <= ${rules.maxGodFiles}`,
        passed: godFiles.length <= rules.maxGodFiles,
        violations: godFiles.slice(0, 10).map(g => ({
            rule: 'max-god-files',
            severity: 'error' as RuleSeverity,
            message: `God file with ${g.fnCount} functions (${g.totalLines} lines)`,
            filePath: g.filePath,
            detail: `${g.fnCount} functions`,
        })),
    });

    // Rule 3: Duplicates limit
    const dupes = await driver.runQuery<{ bodyHash: string; cnt: number }>(
        `MATCH (f:Function ${pf})
         WHERE f.bodyHash IS NOT NULL AND (f.endLine - f.startLine) >= 3
         WITH f.bodyHash as bodyHash, count(*) as cnt
         WHERE cnt > 1
         RETURN bodyHash, cnt
         ORDER BY cnt DESC LIMIT 50`,
        { projectId },
    );
    results.push({
        rule: 'max-duplicates',
        severity: 'warning',
        description: `Duplicate function groups must be <= ${rules.maxDuplicates}`,
        passed: dupes.length <= rules.maxDuplicates,
        violations: dupes.slice(0, 10).map(d => ({
            rule: 'max-duplicates',
            severity: 'warning' as RuleSeverity,
            message: `${d.cnt} functions share identical body (hash: ${d.bodyHash.slice(0, 8)}...)`,
            detail: `${d.cnt} copies`,
        })),
    });

    // Rule 4: High-fan-in functions (too many callers)
    const highFanIn = await driver.runQuery<{ name: string; filePath: string; callerCount: number }>(
        `MATCH (caller)-[:CALLS]->(f:Function ${pf})
         WITH f, count(DISTINCT caller) as callerCount
         WHERE callerCount > $threshold
         RETURN f.name as name, f.filePath as filePath, callerCount
         ORDER BY callerCount DESC LIMIT 20`,
        { projectId, threshold: rules.maxFunctionCallers },
    );
    results.push({
        rule: 'max-function-callers',
        severity: 'warning',
        description: `No function should have > ${rules.maxFunctionCallers} callers`,
        passed: highFanIn.length === 0,
        violations: highFanIn.map(h => ({
            rule: 'max-function-callers',
            severity: 'warning' as RuleSeverity,
            message: `${h.name} has ${h.callerCount} callers — high coupling risk`,
            node: h.name,
            filePath: h.filePath,
            detail: `${h.callerCount} callers`,
        })),
    });

    // Rule 5: DB writes per route
    const routeDbWrites = await driver.runQuery<{ routeName: string; routeFile: string; writeCount: number }>(
        `MATCH (r:Route ${pf})-[:HANDLES]->(fn:Function)
         OPTIONAL MATCH (fn)-[:CALLS*1..4]->(inner:Function)-[:WRITES_TO]->(:DBTable)
         WITH r, count(DISTINCT inner) as writeCount
         WHERE writeCount > $threshold
         RETURN r.name as routeName, r.filePath as routeFile, writeCount
         ORDER BY writeCount DESC LIMIT 20`,
        { projectId, threshold: rules.maxDbWritesPerRoute },
    );
    results.push({
        rule: 'max-db-writes-per-route',
        severity: 'warning',
        description: `Routes should not trigger > ${rules.maxDbWritesPerRoute} DB write functions`,
        passed: routeDbWrites.length === 0,
        violations: routeDbWrites.map(r => ({
            rule: 'max-db-writes-per-route',
            severity: 'warning' as RuleSeverity,
            message: `Route ${r.routeName} triggers ${r.writeCount} DB write functions`,
            node: r.routeName,
            filePath: r.routeFile,
            detail: `${r.writeCount} write functions`,
        })),
    });

    // Rule 6: Circular imports
    if (rules.noCircularImports) {
        const cycles = await driver.runQuery<{ filePath: string; targetPath: string }>(
            `MATCH (a:File ${pf})-[:DEPENDS_ON]->(b:File ${pf})-[:DEPENDS_ON]->(a)
             WHERE id(a) < id(b)
             RETURN a.path as filePath, b.path as targetPath
             LIMIT 50`,
            { projectId },
        );
        results.push({
            rule: 'no-circular-imports',
            severity: 'error',
            description: 'No circular file-level imports allowed',
            passed: cycles.length === 0,
            violations: cycles.slice(0, 20).map(c => ({
                rule: 'no-circular-imports',
                severity: 'error' as RuleSeverity,
                message: `Circular import: ${c.filePath} <-> ${c.targetPath}`,
                filePath: c.filePath,
                detail: c.targetPath,
            })),
        });
    }

    // Rule 7: Long functions
    const longFunctions = await driver.runQuery<{ name: string; filePath: string; lineCount: number }>(
        `MATCH (f:Function ${pf})
         WHERE (f.endLine - f.startLine) > $threshold
         RETURN f.name as name, f.filePath as filePath, (f.endLine - f.startLine) as lineCount
         ORDER BY lineCount DESC LIMIT 30`,
        { projectId, threshold: rules.maxFunctionLines },
    );
    results.push({
        rule: 'max-function-lines',
        severity: 'warning',
        description: `Functions should not exceed ${rules.maxFunctionLines} lines`,
        passed: longFunctions.length === 0,
        violations: longFunctions.slice(0, 10).map(f => ({
            rule: 'max-function-lines',
            severity: 'warning' as RuleSeverity,
            message: `${f.name} is ${f.lineCount} lines long`,
            node: f.name,
            filePath: f.filePath,
            detail: `${f.lineCount} lines`,
        })),
    });

    // Rule 8: Long files
    const longFiles = await driver.runQuery<{ filePath: string; lineCount: number }>(
        `MATCH (f:File ${pf})
         WHERE COALESCE(f.lineCount, 0) > $threshold
         RETURN f.path as filePath, COALESCE(f.lineCount, 0) as lineCount
         ORDER BY lineCount DESC LIMIT 30`,
        { projectId, threshold: rules.maxFileLines },
    );
    results.push({
        rule: 'max-file-lines',
        severity: 'warning',
        description: `Files should not exceed ${rules.maxFileLines} lines`,
        passed: longFiles.length === 0,
        violations: longFiles.slice(0, 10).map(f => ({
            rule: 'max-file-lines',
            severity: 'warning' as RuleSeverity,
            message: `File is ${f.lineCount} lines long`,
            filePath: f.filePath,
            detail: `${f.lineCount} lines`,
        })),
    });

    // Rule 9: Security issues
    const secIssues = await driver.runQuery<{ name: string; filePath: string; severity: string; category: string }>(
        `MATCH (s:SecurityIssue ${pf})
         RETURN s.name as name, s.filePath as filePath, s.severity as severity, s.category as category
         ORDER BY s.severity LIMIT 100`,
        { projectId },
    );
    results.push({
        rule: 'max-security-issues',
        severity: 'error',
        description: `Security issues must be <= ${rules.maxSecurityIssues}`,
        passed: secIssues.length <= rules.maxSecurityIssues,
        violations: secIssues.slice(0, 20).map(s => ({
            rule: 'max-security-issues',
            severity: 'error' as RuleSeverity,
            message: `${s.severity.toUpperCase()}: ${s.category} — ${s.name}`,
            filePath: s.filePath,
            detail: `${s.severity} / ${s.category}`,
        })),
    });

    // Custom Cypher rules
    if (rules.customRules && rules.customRules.length > 0) {
        for (const custom of rules.customRules) {
            const severity: RuleSeverity = custom.severity ?? 'warning';
            const maxAllowed = custom.maxResults ?? 0;
            try {
                const rows = await driver.runQuery<Record<string, unknown>>(
                    custom.cypher,
                    { projectId },
                );
                const passed = rows.length <= maxAllowed;
                results.push({
                    rule: `custom:${custom.name}`,
                    severity,
                    description: custom.description ?? custom.name,
                    passed,
                    violations: rows.slice(0, 20).map(row => {
                        const name = String(row.name ?? row.filePath ?? row.node ?? '');
                        const filePath = row.filePath ? String(row.filePath) : undefined;
                        return {
                            rule: `custom:${custom.name}`,
                            severity,
                            message: name || JSON.stringify(row),
                            node: name || undefined,
                            filePath,
                        };
                    }),
                });
            } catch (err) {
                results.push({
                    rule: `custom:${custom.name}`,
                    severity: 'error',
                    description: `Custom rule failed: ${err instanceof Error ? err.message : String(err)}`,
                    passed: false,
                    violations: [{
                        rule: `custom:${custom.name}`,
                        severity: 'error',
                        message: `Cypher error: ${err instanceof Error ? err.message : String(err)}`,
                    }],
                });
            }
        }
    }

    // Summary
    const errors = results.filter(r => !r.passed && r.severity === 'error').length;
    const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;
    const info = results.filter(r => !r.passed && r.severity === 'info').length;
    const allPassed = results.every(r => r.passed);

    return { passed: allPassed, results, summary: { errors, warnings, info } };
}
