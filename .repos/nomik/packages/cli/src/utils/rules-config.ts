import fs from 'node:fs';
import path from 'node:path';
import type { RulesConfig, CustomRule } from '@nomik/graph';

const NOMIK_DIR = '.nomik';
const RULES_FILE = 'rules.yaml';

/**
 * Load rules config from .nomik/rules.yaml (simple YAML parser — no dependency needed).
 *
 * Supported keys (same as RulesConfig):
 *   maxDeadCode: 5
 *   maxGodFiles: 3
 *   maxGodFileThreshold: 10
 *   maxDuplicates: 2
 *   maxFunctionCallers: 50
 *   maxDbWritesPerRoute: 3
 *   noCircularImports: true
 *   maxFunctionLines: 200
 *   maxFileLines: 1000
 *   requireEnvVarDefaults: false
 *   maxSecurityIssues: 0
 */
export function loadRulesConfig(cwd: string = process.cwd()): RulesConfig | null {
    const filePath = path.join(cwd, NOMIK_DIR, RULES_FILE);
    if (!fs.existsSync(filePath)) return null;

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return parseSimpleYaml(raw);
    } catch {
        return null;
    }
}

/**
 * Create a default .nomik/rules.yaml with sensible defaults.
 */
export function createDefaultRulesConfig(cwd: string = process.cwd()): string {
    const dir = path.join(cwd, NOMIK_DIR);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, RULES_FILE);
    const content = `# NOMIK Architecture Rules
# These rules are evaluated by \`nomik rules\` and the nm_rules MCP tool.
# Adjust thresholds to match your team's quality standards.

# Maximum allowed dead code functions
maxDeadCode: 5

# Maximum allowed god files (files with too many functions)
maxGodFiles: 3

# Function count threshold for god file detection
maxGodFileThreshold: 10

# Maximum allowed duplicate function groups
maxDuplicates: 2

# Maximum callers per function (high fan-in = coupling risk)
maxFunctionCallers: 50

# Maximum DB write functions triggered per route
maxDbWritesPerRoute: 3

# Disallow circular file-level imports
noCircularImports: true

# Maximum lines per function
maxFunctionLines: 200

# Maximum lines per file
maxFileLines: 1000

# Maximum security issues allowed
maxSecurityIssues: 0

# ── Custom Cypher Rules ──────────────────────────────────
# Define custom rules using Cypher queries.
# Each rule runs the query and fails if it returns more than maxResults rows.
# The query should return 'name' and/or 'filePath' columns for violation details.
#
# customRules:
#   - name: no-large-classes
#     description: Classes should not have more than 20 methods
#     severity: warning
#     maxResults: 0
#     cypher: |
#       MATCH (c:Class)<-[:CONTAINS]-(f:File)
#       WITH c, f, size((c)-[:CONTAINS]->()) as methodCount
#       WHERE methodCount > 20
#       RETURN c.name as name, f.path as filePath
#
#   - name: no-orphan-files
#     description: Files should have at least one dependency
#     severity: info
#     maxResults: 5
#     cypher: |
#       MATCH (f:File)
#       WHERE NOT (f)-[:DEPENDS_ON]->() AND NOT ()-[:DEPENDS_ON]->(f)
#       RETURN f.path as filePath, f.name as name
`;

    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
}

/**
 * Minimal YAML parser — handles key: value pairs (flat, no nesting).
 * Supports: strings, numbers, booleans. Ignores comments (#) and blank lines.
 */
function parseSimpleYaml(raw: string): RulesConfig {
    const config: Record<string, unknown> = {};
    const lines = raw.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

        // Detect customRules: block
        if (trimmed === 'customRules:') {
            const customRules = parseCustomRulesBlock(lines, i + 1);
            config.customRules = customRules.rules;
            i = customRules.endIndex;
            continue;
        }

        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) { i++; continue; }

        const key = trimmed.slice(0, colonIdx).trim();
        const value = trimmed.slice(colonIdx + 1).trim();

        // Remove inline comments
        const commentIdx = value.indexOf('#');
        const cleanValue = commentIdx >= 0 ? value.slice(0, commentIdx).trim() : value;

        if (cleanValue === 'true') config[key] = true;
        else if (cleanValue === 'false') config[key] = false;
        else if (/^\d+$/.test(cleanValue)) config[key] = Number(cleanValue);
        else if (/^\d+\.\d+$/.test(cleanValue)) config[key] = Number(cleanValue);
        else config[key] = cleanValue;

        i++;
    }

    return config as RulesConfig;
}

/**
 * Parse a YAML-like customRules block.
 *
 * Format:
 *   customRules:
 *     - name: rule-name
 *       description: ...
 *       severity: warning
 *       maxResults: 0
 *       cypher: |
 *         MATCH (n) RETURN n
 */
function parseCustomRulesBlock(lines: string[], startIdx: number): { rules: CustomRule[]; endIndex: number } {
    const rules: CustomRule[] = [];
    let i = startIdx;
    let currentRule: Partial<CustomRule> | null = null;
    let inCypherBlock = false;
    let cypherLines: string[] = [];

    while (i < lines.length) {
        const raw = lines[i] ?? '';
        const trimmed = raw.trim();

        // End of customRules block: non-indented, non-empty, non-comment line
        if (trimmed && !trimmed.startsWith('#') && !raw.startsWith(' ') && !raw.startsWith('\t')) {
            break;
        }

        if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

        // New rule item: "- name: ..."
        if (trimmed.startsWith('- name:')) {
            // Save previous rule
            if (currentRule && currentRule.name) {
                if (inCypherBlock && cypherLines.length > 0) {
                    currentRule.cypher = cypherLines.join('\n').trim();
                }
                if (currentRule.cypher) rules.push(currentRule as CustomRule);
            }
            currentRule = { name: trimmed.slice(7).trim() };
            inCypherBlock = false;
            cypherLines = [];
            i++;
            continue;
        }

        if (!currentRule) { i++; continue; }

        // Inside a cypher block (indented lines after "cypher: |")
        if (inCypherBlock) {
            // Still indented? Collect cypher content
            const indent = raw.search(/\S/);
            if (indent >= 6) {
                cypherLines.push(trimmed);
                i++;
                continue;
            } else {
                // End of cypher block
                currentRule.cypher = cypherLines.join('\n').trim();
                inCypherBlock = false;
                // Don't increment — re-parse this line
                continue;
            }
        }

        // Parse rule properties
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) { i++; continue; }

        const key = trimmed.slice(0, colonIdx).trim();
        const value = trimmed.slice(colonIdx + 1).trim();

        switch (key) {
            case 'description': currentRule.description = value; break;
            case 'severity': currentRule.severity = value as CustomRule['severity']; break;
            case 'maxResults': currentRule.maxResults = Number(value) || 0; break;
            case 'cypher':
                if (value === '|' || value === '>') {
                    inCypherBlock = true;
                    cypherLines = [];
                } else {
                    currentRule.cypher = value;
                }
                break;
        }

        i++;
    }

    // Save last rule
    if (currentRule && currentRule.name) {
        if (inCypherBlock && cypherLines.length > 0) {
            currentRule.cypher = cypherLines.join('\n').trim();
        }
        if (currentRule.cypher) rules.push(currentRule as CustomRule);
    }

    return { rules, endIndex: i };
}
