import fs from 'node:fs';
import path from 'node:path';
import { parse as parseJsonc } from 'jsonc-parser';
import { getLogger } from '@nomik/core';

// ────────────────────────────────────────────────────────────────────────
// Path Alias Resolution (tsconfig.json / jsconfig.json)
// ────────────────────────────────────────────────────────────────────────

export interface PathAliasConfig {
    configDir: string; // directory containing the tsconfig
    baseDir: string;   // resolved baseUrl
    aliases: Map<string, string>; // prefix → resolved target directory
}

/** Parse a tsconfig.json/jsconfig.json file and extract path aliases */
export function parseTsConfigFile(configPath: string, visited: Set<string> = new Set()): PathAliasConfig | null {
    const absoluteConfigPath = path.resolve(configPath);
    if (visited.has(absoluteConfigPath)) return null;
    visited.add(absoluteConfigPath);

    const config = readJsoncFile(absoluteConfigPath);
    if (!config) return null;

    const aliases = new Map<string, string>();

    // Merge aliases from extended config first, then override with local config.
    const extendsValue = typeof config.extends === 'string' ? config.extends : null;
    const extendedPath = extendsValue ? resolveExtendsConfigPath(absoluteConfigPath, extendsValue) : null;
    if (extendedPath && fs.existsSync(extendedPath)) {
        const extended = parseTsConfigFile(extendedPath, visited);
        if (extended) {
            for (const [prefix, targetDir] of extended.aliases.entries()) {
                aliases.set(prefix, targetDir);
            }
        }
    }

    const compilerOptions = config.compilerOptions ?? {};
    const baseUrl = compilerOptions.baseUrl ?? '.';
    const paths: Record<string, string[]> = compilerOptions.paths ?? {};
    const configDir = path.dirname(absoluteConfigPath);
    const baseDir = path.resolve(configDir, baseUrl);

    for (const [pattern, targets] of Object.entries(paths)) {
        if (!Array.isArray(targets) || targets.length === 0) continue;
        // "@/*" -> prefix "@/", target "./src/*" -> "<baseDir>/src/"
        const prefix = pattern.replace(/\*$/, '');
        const target = (targets[0] as string).replace(/\*$/, '');
        aliases.set(prefix, path.resolve(baseDir, target));
    }

    if (aliases.size === 0) return null;

    getLogger().debug({ configPath: absoluteConfigPath, aliases: Object.fromEntries(aliases) }, 'path aliases detected');
    return { configDir: path.resolve(configDir), baseDir, aliases };
}

export function readJsoncFile(filePath: string): any | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return parseJsonc(content);
    } catch {
        return null;
    }
}

function resolveExtendsConfigPath(configPath: string, extendsValue: string): string | null {
    // Handle relative/absolute extends paths. Package-based extends are ignored for now.
    if (!extendsValue.startsWith('.') && !path.isAbsolute(extendsValue)) return null;
    const configDir = path.dirname(configPath);
    let candidate = path.isAbsolute(extendsValue)
        ? extendsValue
        : path.resolve(configDir, extendsValue);
    if (!path.extname(candidate)) candidate += '.json';
    return candidate;
}

/** Discover all tsconfig.json/jsconfig.json in the scanned files' directory trees.
 *  Supports monorepos: web-app/tsconfig.json, backend/tsconfig.json, etc.
 *  Returns configs sorted by depth (deepest first) so nearest-match resolution works.
 */
export function findAllPathAliases(filePaths: string[]): PathAliasConfig[] {
    const configs: PathAliasConfig[] = [];
    const checkedDirs = new Set<string>();
    const configNames = ['tsconfig.json', 'jsconfig.json'];

    // Walk up each file's directory tree looking for tsconfig/jsconfig
    for (const fp of filePaths) {
        let dir = path.dirname(fp);
        while (dir !== path.dirname(dir)) {
            if (checkedDirs.has(dir)) break; // Already checked this dir and its parents
            checkedDirs.add(dir);

            for (const name of configNames) {
                const configPath = path.join(dir, name);
                if (fs.existsSync(configPath)) {
                    const config = parseTsConfigFile(configPath);
                    if (config) configs.push(config);
                    break; // One config per directory
                }
            }

            dir = path.dirname(dir);
        }
    }

    // Sort by descending depth (deepest first)
    // so nearest-match works: web-app/tsconfig.json before ./tsconfig.json
    configs.sort((a, b) => b.configDir.length - a.configDir.length);
    return configs;
}

/** Resolve a relative import to the target file's ID.
 *  Handles ESM remapping .js → .ts and Python/Rust extensions.
 */
export function resolveImportPath(
    importerPath: string,
    importSource: string,
    filePathToId: Map<string, string>,
): string | null {
    const dir = path.dirname(importerPath);
    const base = path.resolve(dir, importSource);

    // ESM remapping: import './foo.js' → try foo.ts first
    const stripped = base.replace(/\.(js|jsx|mjs|cjs)$/, '');
    const hasJsExt = stripped !== base;

    const candidates = hasJsExt
        ? [
            stripped + '.ts',
            stripped + '.tsx',
            stripped + '.js',
            stripped + '.jsx',
            stripped + '/index.ts',
            stripped + '/index.tsx',
            stripped + '/index.js',
            stripped,
            base,
        ]
        : [
            base + '.ts',
            base + '.tsx',
            base + '.js',
            base + '.jsx',
            base + '.py',
            base + '.rs',
            base + '/index.ts',
            base + '/index.tsx',
            base + '/index.js',
            base + '/mod.rs',
            base,
        ];

    for (const candidate of candidates) {
        const normalized = path.resolve(candidate);
        const id = filePathToId.get(normalized);
        if (id) return id;
    }
    return null;
}

/** Resolve an aliased import by finding the closest tsconfig to the importing file
 *  Monorepo-safe: each sub-project can have its own aliases
 */
export function resolveAliasImportMulti(
    importSource: string,
    importerPath: string,
    configs: PathAliasConfig[],
    filePathToId: Map<string, string>,
): string | null {
    const importerDir = path.resolve(path.dirname(importerPath));

    // Trouver le tsconfig le plus proche (deepest-first grace au tri)
    for (const config of configs) {
        if (!importerDir.startsWith(config.configDir)) continue;

        // Essayer chaque alias de ce config
        for (const [prefix, targetDir] of config.aliases) {
            if (!importSource.startsWith(prefix)) continue;
            const rest = importSource.slice(prefix.length);
            const searchBases = [path.join(targetDir, rest)];

            // Practical fallback for monorepo setups where @/* should resolve to <project>/src/*
            // but inherited paths from extended tsconfig may point to a shared root.
            if (prefix === '@/') {
                searchBases.push(path.join(config.configDir, 'src', rest));
            }

            for (const base of searchBases) {
                const candidates = [
                    base + '.ts',
                    base + '.tsx',
                    base + '.js',
                    base + '.jsx',
                    base + '/index.ts',
                    base + '/index.tsx',
                    base + '/index.js',
                    base,
                ];

                for (const candidate of candidates) {
                    const normalized = path.resolve(candidate);
                    const id = filePathToId.get(normalized);
                    if (id) return id;
                }
            }
        }
    }

    // Last-resort heuristic for '@/...' imports in projects where tsconfig alias
    // resolution is incomplete due workspace-specific config layering.
    if (importSource.startsWith('@/')) {
        const rest = importSource.slice(2);
        const guessedBase = guessProjectSrcBase(importerPath, rest);
        if (guessedBase) {
            const candidates = [
                guessedBase + '.ts',
                guessedBase + '.tsx',
                guessedBase + '.js',
                guessedBase + '.jsx',
                guessedBase + '/index.ts',
                guessedBase + '/index.tsx',
                guessedBase + '/index.js',
                guessedBase,
            ];
            for (const candidate of candidates) {
                const normalized = path.resolve(candidate);
                const id = filePathToId.get(normalized);
                if (id) return id;
            }
        }
    }
    return null;
}

function guessProjectSrcBase(importerPath: string, rest: string): string | null {
    const normalized = path.resolve(importerPath);
    const segments = normalized.split(path.sep);
    const srcIdx = segments.lastIndexOf('src');
    if (srcIdx <= 0) return null;
    const projectRoot = segments.slice(0, srcIdx).join(path.sep);
    if (!projectRoot) return null;
    return path.join(projectRoot, 'src', rest);
}

// ────────────────────────────────────────────────────────────────────────
// Python import path resolution
// ────────────────────────────────────────────────────────────────────────

/**
 * Resolve a Python import to the target file's ID.
 *
 * Handles:
 *  - Relative imports: ".models" → same-dir/models.py, "..utils" → parent-dir/utils.py
 *  - Absolute imports: "search.utils" → suffix-match search/utils.py in known files
 */
export function resolvePythonImportPath(
    importerPath: string,
    importSource: string,
    filePathToId: Map<string, string>,
): string | null {
    // Count leading dots for relative imports
    let dotCount = 0;
    while (dotCount < importSource.length && importSource[dotCount] === '.') {
        dotCount++;
    }

    const isRelative = dotCount > 0;
    const modulePart = importSource.slice(dotCount); // "models", "utils", "search.utils", or "" (bare ".")
    const segments = modulePart ? modulePart.split('.') : [];

    if (isRelative) {
        // Relative import: 1 dot = same dir, 2 dots = parent dir, etc.
        let dir = path.dirname(importerPath);
        for (let i = 1; i < dotCount; i++) {
            dir = path.dirname(dir);
        }
        const base = segments.length > 0 ? path.join(dir, ...segments) : dir;
        return findPythonFile(base, filePathToId);
    }

    // Absolute import: suffix-match against known file paths
    return findPythonFileByModuleSuffix(segments, filePathToId);
}

/** Try base.py, base/__init__.py */
function findPythonFile(base: string, filePathToId: Map<string, string>): string | null {
    const candidates = [
        base + '.py',
        path.join(base, '__init__.py'),
    ];
    for (const candidate of candidates) {
        const normalized = path.resolve(candidate);
        const id = filePathToId.get(normalized);
        if (id) return id;
    }
    return null;
}

/**
 * Suffix-match: "search.utils" → find any file path ending in /search/utils.py
 * or /search/utils/__init__.py among known files.
 */
function findPythonFileByModuleSuffix(segments: string[], filePathToId: Map<string, string>): string | null {
    if (segments.length === 0) return null;
    const joined = segments.join('/');
    const pySuffix = '/' + joined + '.py';
    const initSuffix = '/' + joined + '/__init__.py';

    for (const [fp, id] of filePathToId) {
        const normalized = fp.replace(/\\/g, '/');
        if (normalized.endsWith(pySuffix) || normalized.endsWith(initSuffix)) {
            return id;
        }
    }
    return null;
}
