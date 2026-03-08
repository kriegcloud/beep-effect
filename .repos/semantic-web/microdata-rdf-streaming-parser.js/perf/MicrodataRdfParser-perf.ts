#!/usr/bin/env node
/* eslint-disable no-console */
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { MicrodataRdfParser } from '..';

if (process.argv.length !== 3) {
  console.error('Usage: MicrodataRdfParser-perf.js filename');
  process.exit(1);
}

const fileName = resolve(process.cwd(), process.argv[2]);
const options = { baseIRI: `file://${fileName}` };

const TEST = `- Parsing file ${fileName}`;
console.time(TEST);

let count = 0;
createReadStream(fileName)
  .pipe(new MicrodataRdfParser(options))
  .on('data', data => {
    // Console.log(JSON.stringify(require('rdf-string').quadToStringQuad(data))); // TODO
    count++;
  })
  .on('error', error => {
    console.error(error);
    process.exit(1);
  })
  .on('end', () => {
    console.timeEnd(TEST);
    console.log(`* Quads parsed: ${count}`);
    console.log(`* Memory usage: ${Math.round(process.memoryUsage().rss / 1_024 / 1_024)}MB`);
  });
/* eslint-enable no-console */
