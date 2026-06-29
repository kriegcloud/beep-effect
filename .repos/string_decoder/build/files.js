/* This file lists the files to be fetched from the node repo
 * in the /lib/ directory which will be placed in the ../lib/
 * directory after having each of the "replacements" in the
 * array for that file applied to it. The replacements are
 * simply the arguments to String#replace, so they can be
 * strings, regexes, functions.
 */

module.exports['string_decoder.js'] = [

    // we do not need internal/util anymore
    [
        /const internalUtil = require\('internal\/util'\);/
      , ''
    ]

  , [
    /(?:var|const) (?:{ )Buffer(?: }) = require\('buffer'\)(?:\.Buffer)?;/,
    `/*<replacement>*/
  var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/
`
    ]

    // add Buffer.isEncoding where missing
  , [
        /const isEncoding = Buffer\[internalUtil.kIsEncodingSymbol\];/
      ,   '\nvar isEncoding = Buffer.isEncoding'
        + '\n  || function(encoding) {'
        + '\n       encoding = \'\' + encoding'
        + '\n       switch (encoding && encoding.toLowerCase()) {'
        + '\n         case \'hex\': case \'utf8\': case \'utf-8\': case \'ascii\': case \'binary\': case \'base64\': case \'ucs2\': case \'ucs-2\': case \'utf16le\': case \'utf-16le\': case \'raw\': return true;'
        + '\n         default: return false;'
        + '\n       }'
        + '\n     }'
        + '\n'

        + '\nfunction _normalizeEncoding(enc) {'
        + '\n   if (!enc) return \'utf8\';'
        + '\n   var retried;'
        + '\n   while (true) {'
        + '\n     switch (enc) {'
        + '\n       case \'utf8\':'
        + '\n       case \'utf-8\':'
        + '\n         return \'utf8\';'
        + '\n       case \'ucs2\':'
        + '\n       case \'ucs-2\':'
        + '\n       case \'utf16le\':'
        + '\n       case \'utf-16le\':'
        + '\n         return \'utf16le\';'
        + '\n       case \'latin1\':'
        + '\n       case \'binary\':'
        + '\n         return \'latin1\';'
        + '\n       case \'base64\':'
        + '\n       case \'ascii\':'
        + '\n       case \'hex\':'
        + '\n         return enc;'
        + '\n       default:'
        + '\n         if (retried) return; // undefined'
        + '\n         enc = (\'\' + enc).toLowerCase();'
        + '\n         retried = true;'
        + '\n     }'
        + '\n   }'
        + '\n };'
    ]


    // use custom Buffer.isEncoding reference
  , [
        /Buffer\.isEncoding\(/g
      , 'isEncoding\('
    ]

    // use _normalizeEncoding everywhere
  , [
        /internalUtil\.normalizeEncoding/g
      , '_normalizeEncoding'
    ]

]
