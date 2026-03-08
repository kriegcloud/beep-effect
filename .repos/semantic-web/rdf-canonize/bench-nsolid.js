/*
 * Copyright (c) 2016-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const canonize = require('./index')._canonizeSync;
//const canonize = require('./index').canonize;
import {setTimeout} from 'node:timers/promises';
const nsolid = require('nsolid');
const KEYS = ['subject', 'predicate', 'object', 'graph'];

(async () => {
  if(nsolid.profile) {
    await setTimeout(3000);
    nsolid.profile(60000);
  }

  const quads = [
    // uncomment to trigger hash first degree nquads
    quad('_:x0', 'ex:foo1', 'ex:obj'),
    quad('_:x1', 'ex:foo2', 'ex:obj'),
    quad('_:x2', 'ex:foo3', 'ex:obj'),
    // triggers loop w/simple flag usage
    quad('_:x3', 'ex:foo1', '_:x4'),
    quad('_:x4', 'ex:foo2', 'ex:obj1'),
    quad('_:x5', 'ex:foo1', '_:x6'),
    quad('_:x6', 'ex:foo2', 'ex:obj2'),

    // uncomment to trigger hash nquads w/significant permutations
    // quad('_:b0', 'http://example.org/vocab#p', '_:b1'),
    // quad('_:b0', 'http://example.org/vocab#p', '_:b2'),
    // quad('_:b0', 'http://example.org/vocab#p', '_:b3'),
    // quad('_:b1', 'http://example.org/vocab#p', '_:b0'),
    // quad('_:b1', 'http://example.org/vocab#p', '_:b3'),
    // quad('_:b1', 'http://example.org/vocab#p', '_:b4'),
    // quad('_:b2', 'http://example.org/vocab#p', '_:b0'),
    // quad('_:b2', 'http://example.org/vocab#p', '_:b4'),
    // quad('_:b2', 'http://example.org/vocab#p', '_:b5'),
    // quad('_:b3', 'http://example.org/vocab#p', '_:b0'),
    // quad('_:b3', 'http://example.org/vocab#p', '_:b1'),
    // quad('_:b3', 'http://example.org/vocab#p', '_:b5'),
    // quad('_:b4', 'http://example.org/vocab#p', '_:b1'),
    // quad('_:b4', 'http://example.org/vocab#p', '_:b2'),
    // quad('_:b4', 'http://example.org/vocab#p', '_:b5'),
    // quad('_:b5', 'http://example.org/vocab#p', '_:b3'),
    // quad('_:b5', 'http://example.org/vocab#p', '_:b2'),
    // quad('_:b5', 'http://example.org/vocab#p', '_:b4'),
    // quad('_:b6', 'http://example.org/vocab#p', '_:b7'),
    // quad('_:b6', 'http://example.org/vocab#p', '_:b8'),
    // quad('_:b6', 'http://example.org/vocab#p', '_:b9'),
    // quad('_:b7', 'http://example.org/vocab#p', '_:b6'),
    // quad('_:b7', 'http://example.org/vocab#p', '_:b10'),
    // quad('_:b7', 'http://example.org/vocab#p', '_:b11'),
    // quad('_:b8', 'http://example.org/vocab#p', '_:b6'),
    // quad('_:b8', 'http://example.org/vocab#p', '_:b10'),
    // quad('_:b8', 'http://example.org/vocab#p', '_:b11'),
    // quad('_:b9', 'http://example.org/vocab#p', '_:b6'),
    // quad('_:b9', 'http://example.org/vocab#p', '_:b10'),
    // quad('_:b9', 'http://example.org/vocab#p', '_:b11'),
    // quad('_:b10', 'http://example.org/vocab#p', '_:b7'),
    // quad('_:b10', 'http://example.org/vocab#p', '_:b8'),
    // quad('_:b10', 'http://example.org/vocab#p', '_:b9'),
    // quad('_:b11', 'http://example.org/vocab#p', '_:b7'),
    // quad('_:b11', 'http://example.org/vocab#p', '_:b8'),
    // quad('_:b11', 'http://example.org/vocab#p', '_:b9'),
  ];

  try {
    //const count = 1;
    //const count = 2000; // ~0.2 secs
    //const count = 20000; // ~0.6 secs
    const count = 100000; // ~5.8 secs <-- updated
    //const count = 200000; // ~5 secs
    //const count = 600000; // ~10 secs
    //const count = 1000000; // ~30 secs
    for(let i = 0; i < count; ++i) {
      /*const result = */await canonize(quads, {
        algorithm: 'RDFC-1.0',
        usePureJavaScript: true
      });
      //console.log(result);
    }
  } catch(e) {
    console.error(e);
  }

  if(nsolid.profile) {
    nsolid.profileEnd();
  }
})();

function bnode(v) {
  return {
    termType: 'BlankNode',
    value: v
  };
}

function namednode(v) {
  return {
    termType: 'NamedNode',
    value: v
  };
}

function quad() {
  const quad = {};

  for(let i = 0; i < arguments.length; ++i) {
    const key = KEYS[i];
    const arg = arguments[i];
    if(arg.startsWith('_:')) {
      quad[key] = bnode(arg);
    } else {
      quad[key] = namednode(arg);
    }
  }

  if(arguments.length < 4) {
    quad.graph = {
      termType: 'DefaultGraph',
      value: ''
    };
  }

  return quad;
}
