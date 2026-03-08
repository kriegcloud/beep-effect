/* ShapeMap - javascript module to associate RDF nodes with labeled shapes.
 *
 * See README for description.
 */

const ShapeMapCjsModule = (function () {

  const symbols = require("./lib/ShapeMapSymbols")

  // Write the parser object directly into the symbols so the caller shares a
  // symbol space with ShapeMapJison for e.g. start and focus.
  symbols.Parser = require("./lib/ShapeMapParser")
  return symbols
})();

// Export the `ShExValidator` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShapeMapCjsModule;
