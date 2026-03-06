import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import type { TargetConfig } from '@nomik/core';
import { isSupportedFile } from './languages/index';

/** Paths to exclude even if the glob lets them through (pnpm symlinks) */
const HARD_EXCLUDE = /[\\/](node_modules|dist|\.git|docker|\.next|\.nuxt|\.svelte-kit|build|coverage|public|out|\.turbo)[\\/]/;

/** Minified/bundled files to always exclude */
const HARD_EXCLUDE_FILE = /\.(min|bundle)\.(js|css|mjs)$/;

export async function discoverFiles(config: TargetConfig): Promise<string[]> {
    const root = path.resolve(config.root);

    if (!fs.existsSync(root)) {
        throw new Error(`Target root does not exist: ${root}`);
    }

    const files = await glob(config.include, {
        cwd: root,
        ignore: config.exclude,
        absolute: true,
        nodir: true,
        follow: false,
    });

    return files
        .filter(f => !HARD_EXCLUDE.test(f))
        .filter(f => !HARD_EXCLUDE_FILE.test(f))
        .filter(isSupportedFile)
        .sort();
}
