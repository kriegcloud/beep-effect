const { MicrodataRdfParser } = require("..");

module.exports = {
  parse: function (data, baseIRI, options) {
    return require('arrayify-stream').default(require('streamify-string')(data)
      .pipe(new MicrodataRdfParser(Object.assign({ baseIRI }, options))));
  },
};
