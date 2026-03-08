/**
 * Make tests for benchmarks.
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2017-2023 Digital Bazaar, Inc. All rights reserved.
 */
const fs = require('fs/promises');
const jsonld = require('../../jsonld.js');

async function documentLoader(url) {
  if(url === 'https://w3id.org/test/v1') {
    return {
      document: JSON.parse(await fs.readFile('./test-v1.jsonld'))
    };
  }
  if(url === 'https://w3id.org/webledger/v1') {
    return {
      document: JSON.parse(await fs.readFile('./webledger-v1.jsonld'))
    };
  }
  return jsonld.loadDocument(url);
}

async function bn(b, n) {
  console.log(`Make block-${n}-{in,out}.nq`);
  const data = JSON.parse(JSON.stringify(b));
  //console.log('nq0', data);

  const ev = data.event[0];
  data.event = [];
  //console.log('nq1', data);
  for(let i = 0; i < n; ++i) {
    // copy and change id
    const newEv = JSON.parse(JSON.stringify(ev));
    newEv.input[0].id = newEv.input[0].id + '-' + i;
    //console.log('push', newEv);
    data.event.push(newEv);
  }
  //console.log('nq2', data);

  const nq = await jsonld.toRDF(data, {
    format: 'application/n-quads',
    documentLoader
  });
  await fs.writeFile(`./block-${n}-in.nq`, nq);
  const can = await jsonld.canonize(data, {
    documentLoader
  });
  await fs.writeFile(`./block-${n}-out.nq`, can);
}

async function main() {
  const b1json = await fs.readFile('./block-1.json');
  const b1 = JSON.parse(b1json);

  return Promise.all([
    bn(b1, 1),
    bn(b1, 2),
    bn(b1, 10),
    bn(b1, 100),
    bn(b1, 1000)
  ]).catch(e => console.error(e));
}

(async () => {
  await main();
})();
