import fs from 'node:fs';
import path from 'node:path';
import type { ProjectNode } from '@nomik/core';

const NOMIK_DIR = '.nomik';
const PROJECT_FILE = 'project.json';
/** Current project schema version — increment for future migrations */
export const PROJECT_CONFIG_VERSION = 1;

export interface LocalProjectConfig {
    version: number;
    projectId: string;
    projectName: string;
    createdAt: string;
}

/** Path to .nomik/project.json from current working directory */
function getConfigPath(cwd: string = process.cwd()): string {
    return path.join(cwd, NOMIK_DIR, PROJECT_FILE);
}

/** Read local project config (.nomik/project.json) */
export function readProjectConfig(cwd?: string): LocalProjectConfig | null {
    const configPath = getConfigPath(cwd);
    if (!fs.existsSync(configPath)) return null;
    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw) as LocalProjectConfig;
    } catch {
        return null;
    }
}

/** Write local project config (.nomik/project.json) */
export function writeProjectConfig(config: LocalProjectConfig, cwd?: string): void {
    const dir = path.join(cwd ?? process.cwd(), NOMIK_DIR);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const configPath = path.join(dir, PROJECT_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/** Generate a ProjectNode from a name */
export function createProjectNode(name: string, rootPath?: string): ProjectNode {
    const slug = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
    return {
        id: slug,
        type: 'project',
        name,
        rootPath: rootPath ?? process.cwd(),
        createdAt: new Date().toISOString(),
    };
}

/** Derive a project name from the current directory name */
export function defaultProjectName(cwd?: string): string {
    return path.basename(cwd ?? process.cwd());
}
