#!/usr/bin/env node
import {createReadStream} from "fs";
import {resolve} from "path";
import {RdfaParser} from "..";

if (process.argv.length !== 3) {
  console.error('Usage: RdfaParser-perf.js filename');
  process.exit(1);
}

const fileName = resolve(process.cwd(), process.argv[2]);
const options = { baseIRI: 'file://' + fileName };

const TEST = '- Parsing file ' + fileName;
console.time(TEST);

let count = 0;
createReadStream(fileName)
  .pipe(new RdfaParser(options))
  .on('data', () => count++)
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  })
  .on('end', () => {
    console.timeEnd(TEST);
    console.log('* Quads parsed: ' + count);
    console.log('* Memory usage: ' + Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
  });
