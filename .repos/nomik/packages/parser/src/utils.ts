import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

export function createNodeId(type: string, filePath: string, name: string): string {
    const raw = `${type}:${filePath}:${name}`;
    return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export function createFileHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
}

export function createBodyHash(bodyText: string): string {
    const normalized = bodyText.replace(/\s+/g, ' ').trim();
    return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/** Returns the full SHA + current commit info */
export function getGitInfo(): { sha: string; shortSha: string; message: string; author: string; date: string } | null {
    try {
        const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        const shortSha = sha.substring(0, 7);
        const message = execSync('git log -1 --format=%s', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        const author = execSync('git log -1 --format=%an', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        const date = execSync('git log -1 --format=%aI', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        return { sha, shortSha, message, author, date };
    } catch {
        return null;
    }
}
