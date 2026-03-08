#!/usr/bin/env node

import {readFileSync} from "fs";
import {ContextParser} from "../lib/ContextParser";

const argv = process.argv.slice(2);

if (argv.length !== 2) {
  process.stderr.write(`jsonld-context-parse parses JSON-LD contexts

Usage:
  jsonld-context-parse url http://json-ld.org/contexts/person.jsonld
  jsonld-context-parse file path/to/context.jsonld
  jsonld-context-parse arg '{ "xsd": "http://www.w3.org/2001/XMLSchema#" }'
`);
  process.exit(1);
}

const type = argv[0];

let input: any;
let external: boolean = false;
let baseIRI: string | undefined;
switch (type) {
case 'url':
  input = argv[1];
  external = true;
  baseIRI = argv[1];
  break;
case 'file':
  input = JSON.parse(readFileSync(argv[1], 'utf8'));
  baseIRI = 'file://' + argv[1];
  break;
case 'arg':
  input = JSON.parse(argv[1]);
  baseIRI = 'urn:local:';
  break;
default:
  process.stderr.write(`Unknown context type. Choose from url, file or arg.`);
  process.exit(1);
  break;
}

new ContextParser().parse(input, { external, baseIRI })
  .then((context) => {
    process.stdout.write(JSON.stringify(context.getContextRaw(), null, '  '));
    process.stdout.write('\n');
  })
  .catch((err) => {
    process.stderr.write(err.message);
    process.stdout.write('\n');
    process.exit(1);
  });
