N3js = (function () {
  return {
    IRIs:          require('n3/lib/IRIs.js'         ).default,
    DataFactory:   require('n3/lib/N3DataFactory'   ).default,
    Lexer:         require('n3/lib/N3Lexer'         ).default,
    Parser:        require('n3/lib/N3Parser'        ).default,
    Store:         require('n3/lib/N3Store'         ).default,
 // StreamParser:  require('n3/lib/N3StreamParser'  ).default,
 // StreamWriter:  require('n3/lib/N3StreamWriter'  ).default,
    Util:          require('n3/lib/N3Util'          ).default,
    Writer:        require('n3/lib/N3Writer'        ).default,
  }
})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = N3js;
