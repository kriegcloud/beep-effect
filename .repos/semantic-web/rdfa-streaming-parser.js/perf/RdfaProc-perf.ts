#!/usr/bin/env node
import {createReadStream} from "fs";
import {resolve} from "path";

const {JSDOM} = require("jsdom");
const RDFaProcessor = require('rdfa-processor').RDFaProcessor;

if (process.argv.length !== 3) {
  console.error('Usage: RdfaProc-perf.js filename');
  process.exit(1);
}

const fileName = resolve(process.cwd(), process.argv[2]);
const options = { baseIRI: 'file://' + fileName };

const TEST = '- Parsing file ' + fileName;
console.time(TEST);

let lines: string[] = [];
createReadStream(fileName)
  .on('data', (line) => lines.push(<any> line))
  .on('error', (e) => {
    console.error(e);
    process.exit(1);
  })
  .on('end', () => {
    let count = 0;
    const processor = new RDFaProcessor();
    processor.onTriple = () => count++;
    const baseIRI = 'file://' + fileName;
    const document = (new JSDOM(lines.join(''), { url: baseIRI })).window.document;
    processor.process(document, { baseIRI });
    console.timeEnd(TEST);
    console.log('* Quads parsed: ' + count);
    console.log('* Memory usage: ' + Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB');
  });
