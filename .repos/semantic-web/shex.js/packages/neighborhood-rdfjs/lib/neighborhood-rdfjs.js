/** Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset
 */
const NeighborhoodRdfJsModule = (function () {
  const Api = require("@shexjs/neighborhood-api");

  function rdfjsDB (db /*:typeof N3Store*/, queryTracker /*:QueryTracker*/) {

    function getSubjects () { return db.getSubjects(); }
    function getPredicates () { return db.getPredicates(); }
    function getObjects () { return db.getObjects(); }
    function getQuads ()/*: Quad[]*/ { return db.getQuads.apply(db, arguments); }

    function getNeighborhood (point/*: string*/, shapeLabel/*: string*//*, shape */) {
      // I'm guessing a local DB doesn't benefit from shape optimization.
      let startTime;
      if (queryTracker) {
        startTime = new Date();
        queryTracker.start(false, point, shapeLabel);
      }
      const outgoing/*: Quad[]*/ = [... db.match(point, null, null, null)].sort(
        (l, r) => Api.sparqlOrder(l.object, r.object)
      );
      if (queryTracker) {
        const time = new Date();
        queryTracker.end(outgoing, time.valueOf() - startTime.valueOf());
        startTime = time;
      }
      if (queryTracker) {
        queryTracker.start(true, point, shapeLabel);
      }
      const incoming/*: Quad[]*/ = [...db.match(null, null, point, null)].sort(
        (l, r) => Api.sparqlOrder(l.object, r.object)
      );
      if (queryTracker) {
        queryTracker.end(incoming, new Date().valueOf() - startTime.valueOf());
      }
      return {
        outgoing: outgoing,
        incoming: incoming
      };
    }

    return {
      // size: db.size,
      getNeighborhood: getNeighborhood,
      getSubjects: getSubjects,
      getPredicates: getPredicates,
      getObjects: getObjects,
      getQuads: getQuads,
      get size() { return db.size; },
      // getQuads: function (s, p, o, graph, shapeLabel) {
      //   // console.log(Error(s + p + o).stack)
      //   if (queryTracker)
      //     queryTracker.start(!!s, s ? s : o, shapeLabel);
      //   const quads = db.getQuads(s, p, o, graph)
      //   if (queryTracker)
      //     queryTracker.end(quads, new Date() - startTime);
      //   return quads;
      // }
    }
  }

// ## Exports

return exports = {
  name: "neighborhood-rdfjs",
  description: "Implementation of @shexjs/neighborhood-api which gets data from an @rdfjs/dataset",
  ctor: rdfjsDB
};

})();

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = NeighborhoodRdfJsModule;
