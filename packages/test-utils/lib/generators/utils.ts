/* eslint-disable import/no-nodejs-modules */
import path from 'node:path';

// Note that this path is correct AFTER tsc conversion
const staticsPath = path.join(__dirname, '..', '..', '..', '..', 'statics');

export function getStaticFilePath(...paths: string[]): string {
  return path.join(staticsPath, ...paths);
}
