/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * Status: Early implementation
 *
 * TODO:
 *   testing.
 */

const ShapeMapSymbols = (function () {
  return {
    Focus: { term: "FOCUS" },
    Start: { term: "START" },
    Wildcard: { term: "WILDCARD" },
  }
})();

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShapeMapSymbols;
