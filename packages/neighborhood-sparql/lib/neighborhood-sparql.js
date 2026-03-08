/** Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint
 */
const NeighborhoodSparqlModule = (function () {
  const ShExTerm = require("@shexjs/term");
  const ShExUtil = require("@shexjs/util");
  const {ShExVisitor} = require("@shexjs/visitor");
  const RdfJs = require("n3"); // TODO: set global externally

  function sparqlDB (endpoint, queryTracker, options = {}) {
    // Need to inspect the schema to calculate the relevant neighborhood.
    let schemaIndex = null;
    const bnodes = { };

    function getQuads(s, p, o, g) {
      return mapQueryToTriples("SELECT " + [
        (s?"":"?s"), (p?"":"?p"), (o?"":"?o"),
        "{",
        (s?s:"?s"), (p?p:"?s"), (o?o:"?s"),
        "}"].join(" "), s, o)
    }

    function mapQueryToTriples (query, s, o) {
      const rows = ShExUtil.executeQuery(query, endpoint, RdfJs.DataFactory);
      const triples = rows.map(row =>  {
        return s ? {
          subject: s, // arcs out
          predicate: row[0],
          object: row[1]
        } : {
          subject: row[0], // arcs in
          predicate: row[1],
          object: o
        };
      });
      return triples;
    }

    function getTripleConstraints (tripleExpr) {
      class MyVisitor extends ShExVisitor {
        constructor () {
          super();
          this.ret = {
            out: [],
            inc: []
          };
        }
        visitTripleConstraint (expr) {
          this.ret[expr.inverse ? "inc" : "out"].push(expr);
          return expr;
        };

        visitInclusion (inclusion) {
          return this.visitExpression(schemaIndex.tripleExprs[inclusion]);
        }
      }
      const visitor = new MyVisitor();

      if (tripleExpr)
        visitor.visitExpression(tripleExpr);
      return visitor.ret;
    }

    function getNeighborhood (point, shapeLabel, shape) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      const pointStr = find(point);
      const tcs = getTripleConstraints(shape.expression);
      let pz = tcs.out.map(t => t.predicate);
      pz = pz.filter((p, idx) => pz.lastIndexOf(p) === idx);
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing = (tcs.out.length > 0 || shape.closed)
            ? mapQueryToTriples(
              shape.closed || options.allOutgoing
                ? `SELECT ?p ?o { ${pointStr} ?s ?p ?o }`
                : `SELECT ?p ?o { # ${point}\n` + pointStr +
                pz.map(
                  p => `  {?s <${p}> ?o BIND(<${p}> AS ?p)}`
                ).join(" UNION\n") +
                "\n}",
              point, null
            )
            : [];
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time - startTime);
        startTime = time;
      }
      let incoming = [];
      if (tcs.inc.length > 0) {
        if (queryTracker) {
          queryTracker.start(true, point, shapeLabel);
        }
        const incoming = mapQueryToTriples(`SELECT ?s ?p { ?s ?p ${pointStr} }`, null, point);
        if (queryTracker) {
          queryTracker.end(incoming, new Date() - startTime);
        }
      }
      const bnodesByPredicate = outgoing.reduce((acc, t) => {
        if (t.object.termType === "BlankNode") {
          bnodes[t.object.value] = { from: point, p: t.predicate };
          // e.g. { from: "n0", p: "p0" }
          if (!(t.predicate in acc))
            acc[t.predicate] = [];
          acc[t.predicate].push(t.object);
        }
        return acc;
      }, {});
      Object.keys(bnodesByPredicate)
        .filter(p => bnodesByPredicate[p].length > 1)
        .forEach(p => {
          const query = `SELECT ?s ?p ?o { # find bnodes in <${point}> ${p} ?o
${find(bnodesByPredicate[p][0])}  ?s ?p ?o
}`;
          const rows = ShExUtil.executeQuery(query, endpoint, RdfJs.DataFactory);
          const uniques = getUniques(rows);
          Object.keys(uniques).forEach(s => {
            bnodes[s].unique = uniques[s].unique,
            bnodes[s].proxies = uniques[s].proxies
            bnodes[s].see = uniques[s].see
          });
        });
      return  {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      getNeighborhood: getNeighborhood,
      getQuads: getQuads,
      getSubjects: function () { return ["!Query DB can't index subjects"] },
      getPredicates: function () { return ["!Query DB can't index predicates"] },
      getObjects: function () { return ["!Query DB can't index objects"] },
      get size() { return undefined; },
      setSchema: function (schema) { schemaIndex = schema._index || ShExUtil.index(schema) },
    };

    function find (point, depth = 0, recursed = false) {
      if (point.termType !== "BlankNode")
        return recursed
        ? " " + turtlifyRdfJs(point)
        : " BIND (" + turtlifyRdfJs(point) + " AS ?s)\n";

      const see = bnodes[point.value].see || point;
      const s = depth === 0 ? '?s' : `?_${depth}`;
      const {from, p, unique, proxies} = bnodes[see];
      const prior = find(from, depth+1, true);
      const uniqueStr = unique
            ? ".\n" + Object.keys(unique).map(
              p => `  ${s} <${p}> ${unique[p].map(o => `<${o}>`).join(', ')} .
MINUS {
  ${s} <${p}> ${s}_ne .
  FILTER (${s}_ne NOT IN (${unique[p].map(o => `<${o}>`).join(', ')}))
}`
            ).join('\n')
            : '.';
      // "\n# " + JSON.stringify(unique)
      const limitPre = proxies ? "{ SELECT ?s WHERE {\n" : "";
      const limitPost = proxies ? "} LIMIT 1 }" : "";
      return depth === 0
        ? `${limitPre}${prior} <${p}> ?s ${uniqueStr}${limitPost}\n`
        : `${prior} <${p}> ?_${depth}  ${uniqueStr}\n  ?_${depth}`;
    }

    function turtlifyRdfJs (term) {
      switch (term.termType) {
      case "NamedNode": return "<" + term.value + ">";
      case "BlankNode": return "_:" + term.value;
      case "Literal": return "'" + term.value.replace() + "'" +
          (term.language
           ? "@" + term.language
           : term.datatypeString !== "http://www.w3.org/2001/XMLSchema#string"
           ? "^^<" + term.datatypeString + ">"
           : "");
      default: throw Error(`unrecognized termType ${term.termType} in ${term}`);
      }
    }

    function getUniques (rs) {
      // index the result set three ways
      const index = rs.reduce((acc, t) => {
        const [s, p, o] = t;
        if (s.termType !== "BlankNode") // only index bnodes
          return acc;
        acc.sz.add(s);

        indexTriple(acc.spo, s, p, o);
        indexTriple(acc.pso, p, s, o);
        indexTriple(acc.pos, p, o, s);

        return acc;

        function indexTriple (index, a, b, c) {
          if (!(a in index))
            index[a] = {};
          if (!(b in index[a]))
            index[a][b] = [];
          index[a][b].push(c);
        }
      }, {sz: new Set(), spo: {}, pso: {}, pos: {}});

      // use the spo index to find indistinguishable bnodes
      const duplicates = [...index.sz].reduce((acc, s) => {
        const po = index.spo[s];
        const poStr = JSON.stringify(po);
        if (poStr in acc.strs) {
          const firstS = acc.strs[poStr];
          acc.duplicates[s] = firstS;
        } else {
          acc.strs[poStr] = s;
        }
        return acc;
      }, {strs: {}, duplicates:{}}).duplicates;

      // Optimization: order predicates by maximum coverage.
      const pzSortedByObjects = Object.keys(index.pos).sort( // sort by number of unique values
        (l, r) => Object.keys(index.pos[r]).length - Object.keys(index.pos[l]).length
      );

      // Map subjects to their unique attributes.
      return [...index.sz].reduce((acc, s) => {
        if (s in duplicates) {
          const see = duplicates[s]
          // queries for s should use `see` instead
          acc[s].see = see;
          // record that see proxies for s
          addAttr(acc[see], 'proxies', s);
        } else {
          // which other subjects to test for value collisions
          const others = [...index.sz].filter(member => member !== s && !(member in duplicates));
          // walk the power set of properties
          const pzIterator = OrderedPowerSet(pzSortedByObjects, true, false);
          for (const pz of pzIterator) {
            // s's values for this set of properties
            const testUnique = vals(index.pso, s, pz);
            // other subjects with the save values for the same properties
            const conflicts = others.filter(
              other => hashOfArraysEqual(testUnique, vals(index.pso, other, pz))
            );
            if (conflicts.length === 0) {
              // record set of unique p/o that identifies s
              acc[s].unique = testUnique;
              // skip remaining power set
              break;
            }
          };
        }
        return acc;
      }, [...index.sz].reduce((acc, s) => setAttr(acc, s, {}), {}))
    }

    function vals (pso, s, pz) {
      return pz.reduce((acc, p) => {
        acc[p] = pso[p][s]
        return acc;
      }, {});
    }

    function setAttr (obj, attr, val) {
      obj[attr] = val;
      return obj;
    }

    function addAttr (obj, attr, val) {
      if (!(attr in obj))
        obj[attr] = [];
      obj[attr].push(val);
      return obj;
    }

    function hashOfArraysEqual (l, r) {
      if (Object.keys(l).length !== Object.keys(r).length) return false;
      return Object.keys(l).every(k => arrayEqual(l[k], r[k]))
    }
    function arrayEqual (l, r) {
      if (l === undefined && r === undefined) return true;
      if (l === undefined || r === undefined) return true;
      if (l.length !== r.length) return false;
      return l.every((v, idx) => r[idx] === v)
    }

    /** Generates a power set ordered by set length and member order.
     * This algorithm does not keep the entire power set in memory.
     *
     * @param members - array elements to combine in power set, e.g. ['a', 'b']
     * @param unique - whether results have no repeats, e.g. ['a', 'a']
     * @param reorder - whether results include reorderings, e.g ['a', 'b'] and ['b', 'a']
     * @yields elements in the power set, e.g. a,b,c,ab,ac,bc,abc
     */
    function *OrderedPowerSet (members, unique = false, reorder = true) {
      let last;
      let k = null;
      for (k = 1; k <= members.length; ++k)
        yield* combi.call(this, 0, [[]]);

      function *combi (n, comb) {
        let combs = [];
        for (let x = 0; x < comb.length; ++x) {
          const next = reorder
                ? 0 // LSB gets all characters
                : comb.length === 1 && comb[0].length === 0
                ? x // LSB starts after x
                : members.indexOf(comb[x][comb[x].length - 1]) // after last character
          for (let l = next; l < members.length; ++l) {
            if (!unique || comb[x].indexOf(members[l]) === -1) {
              const entry = comb[x].concat([members[l]]);
              if (n === k - 1)
                yield entry;
              else
                combs.push(entry); // build intermediate combinations
            }
          }
        }
        if (n < k - 1) {
          n++;
          yield* combi.call(this, n, combs);
        }
      }
    }
  }

  return {
    name: "neighborhood-sparql",
    description: "Implementation of @shexjs/neighborhood-api which gets data from a SPARQL endpoint",
    ctor: sparqlDB
  };
})();

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = NeighborhoodSparqlModule;
