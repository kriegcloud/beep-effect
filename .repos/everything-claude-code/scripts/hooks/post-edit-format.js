#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files with Prettier after edits
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use. If the edited file is a JS/TS file,
 * formats it with Prettier. Fails silently if Prettier isn't installed.
 */

const { execFileSync } = require('child_process');
const path = require('path');

const MAX_STDIN = 1024 * 1024; // 1MB limit
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx|js|jsx)$/.test(filePath)) {
      try {
        // Use npx.cmd on Windows to avoid shell: true which enables command injection
        const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        execFileSync(npxBin, ['prettier', '--write', filePath], {
          cwd: path.dirname(path.resolve(filePath)),
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 15000
        });
      } catch {
        // Prettier not installed, file missing, or failed — non-blocking
      }
    }
  } catch {
    // Invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
