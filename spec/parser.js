const RdfXmlParser = require("..").RdfXmlParser;

module.exports = {
  parse: function (data, baseIRI) {
    return require('arrayify-stream').arrayifyStream(require('streamify-string')(data).pipe(new RdfXmlParser({ baseIRI })));
  },
};
