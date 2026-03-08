import {DataFactory} from "rdf-data-factory";
import "jest-rdf";
import * as RDF from "@rdfjs/types";
import {PassThrough} from "stream";
import {RdfaParser} from "../lib/RdfaParser";
import {RDFA_FEATURES} from "../lib/RdfaProfile";
import arrayifyStream from "arrayify-stream";

const streamifyString = require('streamify-string');
const quad = require('rdf-quad');

const DF = new DataFactory();

describe('RdfaParser', () => {

  it('should be constructable without args', () => {
    const instance = new RdfaParser();
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode(''));
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with empty args', () => {
    const instance = new RdfaParser({});
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode(''));
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with args with a custom data factory', () => {
    const dataFactory: any = { defaultGraph: () => 'abc', namedNode: () => DF.namedNode('abc') };
    const instance = new RdfaParser({dataFactory});
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBe(dataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode('abc'));
    expect((<any> instance).defaultGraph).toBe('abc');
  });

  it('should be constructable with args with a custom base IRI', () => {
    const instance = new RdfaParser({baseIRI: 'myBaseIRI'});
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode('myBaseIRI'));
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with args with a custom default graph', () => {
    const defaultGraph = DF.namedNode('abc');
    const instance = new RdfaParser({defaultGraph});
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode(''));
    expect((<any> instance).defaultGraph).toBe(defaultGraph);
  });

  it('should be constructable with args with a custom data factory, base IRI and default graph', () => {
    const dataFactory: any = { defaultGraph: () => 'abc', namedNode: () => DF.namedNode('abc') };
    const defaultGraph = DF.namedNode('abc');
    const instance = new RdfaParser({ dataFactory, baseIRI: 'myBaseIRI', defaultGraph });
    expect(instance).toBeInstanceOf(RdfaParser);
    expect((<any> instance).util.dataFactory).toBe(dataFactory);
    expect((<any> instance).util.baseIRI).toEqualRdfTerm(DF.namedNode('abc'));
    expect((<any> instance).defaultGraph).toBe(defaultGraph);
  });

  it('should default to the empty profile when no content type, profile or features was set', () => {
    const instance = new RdfaParser({});
    expect((<any> instance).features).toBe(RDFA_FEATURES['']);
  });

  it('should allow custom features to be set', () => {
    const features: any = { a: 1 };
    const instance = new RdfaParser({ features });
    expect((<any> instance).features).toBe(features);
  });

  it('should allow a profile to be set', () => {
    const instance = new RdfaParser({ profile: 'core' });
    expect((<any> instance).features).toBe(RDFA_FEATURES.core);
  });

  it('should allow a content type to be set', () => {
    const instance = new RdfaParser({ contentType: 'application/xml' });
    expect((<any> instance).features).toBe(RDFA_FEATURES.xml);
  });

  describe('a default instance', () => {

    let parser;

    beforeEach(() => {
      parser = new RdfaParser({ baseIRI: 'http://example.org/' });
    });

    describe('#emitTriple', () => {
      it('should emit on valid terms', async () => {
        const spy = jest.spyOn(parser, 'push');
        parser.emitTriple(DF.namedNode('http://s'), DF.namedNode('http://p'), DF.namedNode('http://o'));
        expect(spy).toHaveBeenCalledWith(quad(
          'http://s',
          'http://p',
          'http://o',
        ));
      });

      it('should not emit on invalid subject', async () => {
        const spy = jest.spyOn(parser, 'push');
        parser.emitTriple(DF.namedNode('s'), DF.namedNode('http://p'), DF.namedNode('http://o'));
        expect(spy).not.toHaveBeenCalled();
      });

      it('should not emit on invalid predicate', async () => {
        const spy = jest.spyOn(parser, 'push');
        parser.emitTriple(DF.namedNode('http://s'), DF.namedNode('p'), DF.namedNode('http://o'));
        expect(spy).not.toHaveBeenCalled();
      });

      it('should not emit on invalid object', async () => {
        const spy = jest.spyOn(parser, 'push');
        parser.emitTriple(DF.namedNode('http://s'), DF.namedNode('http://p'), DF.namedNode('o'));
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('should error', () => {
      it('when an error is thrown in onTagClose', async () => {
        parser.onTagClose = () => {
          throw new Error('Dummy error');
        };
        return expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onTagOpen', async () => {
        parser.onTagOpen = () => {
          throw new Error('Dummy error');
        };
        return expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onText', async () => {
        parser.onText = () => {
          throw new Error('Dummy error');
        };
        return expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onEnd', async () => {
        parser.onEnd = () => {
          throw new Error('Dummy error');
        };
        return expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });
    });

    describe('should parse', () => {
      it('an empty document', async () => {
        return expect(await parse(parser, ``))
          .toBeRdfIsomorphic([]);
      });

      it('property attributes to predicates', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://purl.org/dc/terms/title', '"The Trouble with Bob"'),
          ]);
      });

      it('multi-line strings', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The
Trouble
with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://purl.org/dc/terms/title', '"The\nTrouble\nwith Bob"'),
          ]);
      });

      it('absolute about attributes to subjects', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 about="http://example2.org/" property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example2.org/', 'http://purl.org/dc/terms/title', '"The Trouble with Bob"'),
          ]);
      });

      it('relative about attributes to subjects', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 about="img.jpg" property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/img.jpg', 'http://purl.org/dc/terms/title', '"The Trouble with Bob"'),
          ]);
      });

      it('blank node about attributes to subjects', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 about="_:b1" property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1', 'http://purl.org/dc/terms/title', '"The Trouble with Bob"'),
          ]);
      });

      it('content attributes to objects', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body>
    <div property="http://purl.org/dc/terms/title" resource="img.jpg"></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://purl.org/dc/terms/title', 'http://example.org/img.jpg'),
          ]);
      });

      it('prefixes and expand them', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property="dc:title" resource="img.jpg"></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://purl.org/dc/terms/title', 'http://example.org/img.jpg'),
          ]);
      });

      it('property with default prefix and expand them', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property=":title" resource="img.jpg"></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://www.w3.org/1999/xhtml/vocab#title', 'http://example.org/img.jpg'),
          ]);
      });

      it('base tags and set the baseIRI', async () => {
        const output = await parse(parser, `<html>
<head>
    <base href="http://base.com/" />
</head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property="dc:title" resource="img.jpg"></div>
</body>
</html>`);
        expect(output).toBeRdfIsomorphic([
          quad('http://base.com/', 'http://purl.org/dc/terms/title', 'http://base.com/img.jpg'),
        ]);
        return expect(parser.util.baseIRI).toEqualRdfTerm(DF.namedNode('http://base.com/'));
      });

      it('base tags are ignored when features.baseTag is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        const output = await parse(parser, `<html>
<head>
    <base href="http://base.com/" />
</head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property="dc:title" resource="img.jpg"></div>
</body>
</html>`);
        expect(output).toBeRdfIsomorphic([
          quad('http://example.org/', 'http://purl.org/dc/terms/title', 'http://example.org/img.jpg'),
        ]);
        return expect(parser.util.baseIRI).toEqualRdfTerm(DF.namedNode('http://example.org/'));
      });

      it('base tags with fragment and set the baseIRI', async () => {
        const output = await parse(parser, `<html>
<head>
    <base href="http://base.com/#fragment" />
</head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property="dc:title" resource="img.jpg"></div>
</body>
</html>`);
        expect(output).toBeRdfIsomorphic([
          quad('http://base.com/', 'http://purl.org/dc/terms/title', 'http://base.com/img.jpg'),
        ]);
        return expect(parser.util.baseIRI).toEqualRdfTerm(DF.namedNode('http://base.com/'));
      });

      it('base tags without href and not set the baseIRI', async () => {
        await parse(parser, `<html>
<head>
    <base />
</head>
<body prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
    <div property="dc:title" resource="img.jpg"></div>
</body>
</html>`);
        return expect(parser.util.baseIRI).toEqualRdfTerm(DF.namedNode('http://example.org/'));
      });

      it('typeof with about', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <h2 about="#myDoc" typeof="schema:Document">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#myDoc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document'),
          ]);
      });

      it('empty typeof with defined vocab', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body vocab="http://schema.org/">
    <h2 about="#myDoc" typeof="">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
          ]);
      });

      it('typeofs with about', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <h2 about="#myDoc" typeof="schema:Document1 schema:Document2">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#myDoc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document1'),
            quad('http://example.org/#myDoc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document2'),
          ]);
      });

      it('typeof with resource', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <h2 resource="#myDoc" typeof="schema:Document">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#myDoc', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document'),
          ]);
      });

      it('typeof with about and resource', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <h2 about="#myDoc1" resource="#myDoc2" typeof="schema:Document">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#myDoc1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document'),
          ]);
      });

      it('typeof without about and resource', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <h2 typeof="schema:Document">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Document'),
          ]);
      });

      it('typeof without about and resource and children', async () => {
        return expect(await parse(parser, `<html>
<head></head>
<body prefix="schema: http://schema.org/">
    <div typeof="schema:Person">
        <span property="schema:name">Albert Einstein</span>
        <span property="schema:givenName">Albert</span>
    </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
            quad('_:b1', 'http://schema.org/name', '"Albert Einstein"'),
            quad('_:b1', 'http://schema.org/givenName', '"Albert"'),
          ]);
      });

      it('rel and href as resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p" href="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p', 'http://example.org/o'),
          ]);
      });

      it('rel on root tag', async () => {
        return expect(await parse(parser, `<html rel="http://example.org/p" href="http://example.org/o">
<head>
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p', 'http://example.org/o'),
          ]);
      });

      it('rel and href as resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p" href="http://example.org/o" about="http://example.org/s"
    typeof="http://example.org/Type" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/s', 'http://example.org/p', 'http://example.org/o'),
            quad('http://example.org/s', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
          ]);
      });

      it('rel and resource as resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p" resource="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p', 'http://example.org/o'),
          ]);
      });

      it('rel (2x) and resource as resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p1 http://example.org/p2" resource="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p1', 'http://example.org/o'),
            quad('http://example.org/', 'http://example.org/p2', 'http://example.org/o'),
          ]);
      });

      it('rel and src as resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p" src="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p', 'http://example.org/o'),
          ]);
      });

      it('rev and href as reverse resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rev="http://example.org/p" href="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/o', 'http://example.org/p', 'http://example.org/'),
          ]);
      });

      it('rev and resource as reverse resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rev="http://example.org/p" resource="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/o', 'http://example.org/p', 'http://example.org/'),
          ]);
      });

      it('rev and src as reverse resource link', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rev="http://example.org/p" src="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/o', 'http://example.org/p', 'http://example.org/'),
          ]);
      });

      it('rel, rev and src as reverse resource links', async () => {
        return expect(await parse(parser, `<html>
<head>
    <link rel="http://example.org/p1" rev="http://example.org/p2" src="http://example.org/o" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p1', 'http://example.org/o'),
            quad('http://example.org/o', 'http://example.org/p2', 'http://example.org/'),
          ]);
      });

      it('resource should be prioritized over href', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
    <a property="http://example.org/p" resource="http://example.org/o1" href="http://example.org/o2"></a>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/p', 'http://example.org/o1'),
          ]);
      });

      it('complex combinations of about, rel, rev and href', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p>
			This photo was taken by
			<a about="photo1.jpg" rel="dc:creator" rev="foaf:img"
   				href="http://www.blogger.com/profile/1109404">Mark Birbeck</a>.
		</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/photo1.jpg',
              'http://purl.org/dc/elements/1.1/creator',
              'http://www.blogger.com/profile/1109404'),
            quad('http://www.blogger.com/profile/1109404',
              'http://xmlns.com/foaf/0.1/img',
              'http://example.org/photo1.jpg'),
          ]);
      });

      it('content attributes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p about="photo1.jpg" property="dc:title" content="Portrait of Mark" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/photo1.jpg',
              'http://purl.org/dc/elements/1.1/title',
              '"Portrait of Mark"'),
          ]);
      });

      it('content that overrides text content', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p about="photo1.jpg" property="dc:title" content="Portrait of Mark">Mark Birbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/photo1.jpg',
              'http://purl.org/dc/elements/1.1/title',
              '"Portrait of Mark"'),
          ]);
      });

      it('nested text content', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
<head>
</head>
<body>
  <div about="http://example.org/foaf#me" property="foaf:name">
    <span property="foaf:givenName">John</span>
    <span property="foaf:familyName">Doe</span>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/familyName',
              '"Doe"'),
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/givenName',
              '"John"'),
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/name',
              '"\n    John\n    Doe\n  "'),
          ]);
      });

      it('inline nested text content', async () => {
        // tslint:disable:max-line-length
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
<head>
</head>
<body>
  <div about="http://example.org/foaf#me" property="foaf:name"><span property="foaf:givenName">John</span> <span property="foaf:familyName">Doe</span></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/familyName',
              '"Doe"'),
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/givenName',
              '"John"'),
            quad('http://example.org/foaf#me',
              'http://xmlns.com/foaf/0.1/name',
              '"John Doe"'),
          ]);
        // tslint:enable:max-line-length
      });

      it('datatype to set the object literal datatype', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="xsd:integer">3</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"3"^^http://www.w3.org/2001/XMLSchema#integer'),
          ]);
      });

      it('datatype to set the object literal datatype for content attributes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="xsd:integer" content="3" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"3"^^http://www.w3.org/2001/XMLSchema#integer'),
          ]);
      });

      it('datatype to set the object literal datatype with strings in a nested tag', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="xsd:string"><b>Mark Birbeck</b></p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Mark Birbeck"'),
          ]);
      });

      it('datatype to set the object literal datatype with strings in nested tags', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="xsd:string"><b>M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Mark Birbeck"'),
          ]);
      });

      it('rdf:XMLLiteral datatype to preserve all nested tags', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b some="attribute">M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"<b some="attribute" xmlns:dc="http://purl.org/dc/elements/1.1/"' +
              ' xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
              ' xmlns:xsd="http://www.w3.org/2001/XMLSchema#">M</b>ark' +
              ' <b xmlns:dc="http://purl.org/dc/elements/1.1/"' +
              ' xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
              ' xmlns:xsd="http://www.w3.org/2001/XMLSchema#">' +
              'B</b>irbeck"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('rdf:XMLLiteral datatype to preserve all nested tags without xmlns and prefixes', async () => {
        return expect(await parse(parser, `<html>
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b some="attribute">M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/terms/title',
              '"<b some="attribute">M</b>ark <b>B</b>irbeck"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('rdf:XMLLiteral datatype to inherit all xmlns and prefixes', async () => {
        const attrs = 'xmlns="http://www.w3.org/1999/xhtml" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
          'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#"';
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
xmlns:dc="http://purl.org/dc/elements/1.1/"
prefix="xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b some="attribute">M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              `"<b some="attribute" ${attrs}>M</b>ark <b ${attrs}>B</b>irbeck"`
              + '^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('rdf:XMLLiteral datatype to inherit all xmlns and prefixes an properly merge with xmlns', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
xmlns:dc="http://purl.org/dc/elements/1.1/"
prefix="xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b some="attribute" xmlns="XMLNS">M</b>ark
<b xmlns:dc="DC">B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"<b some="attribute" xmlns="XMLNS" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#">' +
              'M</b>ark\n<b xmlns:dc="DC" xmlns="http://www.w3.org/1999/xhtml" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#">' +
              'B</b>irbeck"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('rdf:XMLLiteral datatype to preserve all nested tags and not ignore RDFa in children', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b property="foaf:firstName">Mark</b></p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"<b property="foaf:firstName" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
              'xmlns:xsd="http://www.w3.org/2001/XMLSchema#">Mark' +
              '</b>"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/firstName',
              '"Mark"'),
          ]);
      });

      it('rdf:XMLLiteral datatype to preserve all nested tags and ignore RDFa in children ' +
        'if features.skipHandlingXmlLiteralChildren is enabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: { skipHandlingXmlLiteralChildren: true } });
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:XMLLiteral"><b property="foaf:firstName">Mark</b></p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"<b property="foaf:firstName" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
              'xmlns:xsd="http://www.w3.org/2001/XMLSchema#">Mark' +
              '</b>"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('rdf:HTML datatype to preserve all nested tags when features.htmlDatatype is enabled', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:HTML"><b some="attribute">M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"<b some="attribute" xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
              'xmlns:xsd="http://www.w3.org/2001/XMLSchema#">M</b>ark ' +
              '<b xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
              'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#">' +
              'B</b>irbeck"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'),
          ]);
      });

      it('rdf:HTML datatype to not preserve all nested tags when features.htmlDatatype is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#
rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" datatype="rdf:HTML"><b some="attribute">M</b>ark <b>B</b>irbeck</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Mark Birbeck"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'),
          ]);
      });

      it('lang to set the object literal language', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" lang="en">abc</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"@en'),
          ]);
      });

      it('lang should be ignored when features.langAttribute is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {}});
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" lang="en">abc</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"'),
          ]);
      });

      it('xml:lang to set the object literal language', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" xml:lang="en">abc</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"@en'),
          ]);
      });

      it('lang to set the object literal language for content attributes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" lang="en" content="abc" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"@en'),
          ]);
      });

      it('xml:lang to set the object literal language for content attributes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" xml:lang="en" content="abc" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"@en'),
          ]);
      });

      it('xml:lang is inherited', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#" xml:lang="en">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" content="abc" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"@en'),
          ]);
      });

      it('xml:lang can be unset', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#" xml:lang="en">
	<head>
		<title>Test 0006</title>
	</head>
	<body>
		<p property="dc:title" content="abc" xml:lang="" />
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"abc"'),
          ]);
      });

      it('time tags with dates', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title">2012-03-18</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18"^^http://www.w3.org/2001/XMLSchema#date'),
          ]);
      });

      it('time tags with dates when features.timeTag is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title">2012-03-18</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18"'),
          ]);
      });

      it('time tags with times', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title">00:00:00Z</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"00:00:00Z"^^http://www.w3.org/2001/XMLSchema#time'),
          ]);
      });

      it('time tags with dateTimes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title">2012-03-18T00:00:00Z</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18T00:00:00Z"^^http://www.w3.org/2001/XMLSchema#dateTime'),
          ]);
      });

      it('time tags with dates in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="2012-03-18">Today</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18"^^http://www.w3.org/2001/XMLSchema#date'),
          ]);
      });

      it('time tags with dates in datetime, with overridden datatype', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="2012-03-18" datatype="xsd:thing">Today</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18"^^http://www.w3.org/2001/XMLSchema#thing'),
          ]);
      });

      it('time tags with dates in datetime when features.datetimeAttribute is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="2012-03-18">Today</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Today"'),
          ]);
      });

      it('time tags with times in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="00:00:00Z">Today</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"00:00:00Z"^^http://www.w3.org/2001/XMLSchema#time'),
          ]);
      });

      it('time tags with dateTimes in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="2012-03-18T00:00:00Z">Today</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"2012-03-18T00:00:00Z"^^http://www.w3.org/2001/XMLSchema#dateTime'),
          ]);
      });

      it('time tags with full durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P2Y6M5DT12H35M30S">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P2Y6M5DT12H35M30S"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with day and hour durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P1DT2H">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P1DT2H"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with month durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P20M">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P20M"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with minute durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="PT20M">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"PT20M"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with durations with optional 0s in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P0Y20M0D">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P0Y20M0D"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with 0 year durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P0Y">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P0Y"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with minus 60 days durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="-P60D">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"-P60D"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with decimal second durations in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="PT1M30.5S">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"PT1M30.5S"^^http://www.w3.org/2001/XMLSchema#duration'),
          ]);
      });

      it('time tags with invalid durations without T for time in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P1M30.5S">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P1M30.5S"'),
          ]);
      });

      it('time tags with invalid durations with unknown character in datetime', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#">
	<head>
	</head>
	<body>
	  <time property="dc:title" datetime="P2X6M5DT12H35M30S">Long</time>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"P2X6M5DT12H35M30S"'),
          ]);
      });

      it('vocab emits an rdfa:usesVocabulary triple', async () => {
        return expect(await parse(parser, `<html vocab="http://xmlns.com/foaf/0.1/">
	<head>
	</head>
	<body>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://xmlns.com/foaf/0.1/'),
          ]);
      });

      it('vocab sets the active vocabulary', async () => {
        return expect(await parse(parser, `<html vocab="http://xmlns.com/foaf/0.1/">
	<head>
	</head>
	<body>
	  <p property="name">Name</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://xmlns.com/foaf/0.1/'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Name"'),
          ]);
      });

      it('vocab override the active vocabulary', async () => {
        return expect(await parse(parser, `<html vocab="http://example.org/">
	<head>
	</head>
	<body vocab="http://xmlns.com/foaf/0.1/">
	  <p property="name">Name</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://example.org/'),
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://xmlns.com/foaf/0.1/'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Name"'),
          ]);
      });

      it('with vocab set in parser constructor', async () => {
        parser = new RdfaParser({
          baseIRI: 'http://example.org/',
          vocab: 'http://xmlns.com/foaf/0.1/',
        });
        return expect(await parse(parser, `<html>
	<head>
	</head>
	<body>
	  <p property="name">Name</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Name"'),
          ]);
      });

      it('with language set in parser constructor', async () => {
        parser = new RdfaParser({
          baseIRI: 'http://example.org/',
          language: 'nl-be',
        });
        return expect(await parse(parser, `<html>
	<head>
	</head>
	<body>
	  <p property="http://xmlns.com/foaf/0.1/name">Name</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Name"@nl-be'),
          ]);
      });

      it('multiple properties', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
	</head>
	<body>
	  <p property="dc:title foaf:title">Title</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Title"'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/title',
              '"Title"'),
          ]);
      });

      it('multiple properties separated by newlines and spaces', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
	</head>
	<body>
	  <p property="dc:title
	  foaf:title">Title</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Title"'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/title',
              '"Title"'),
          ]);
      });

      it('chained rel and property', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
	</head>
  <body>
  	<p>
    	This paper was written by
    	<span rel="dc:creator">
      		<span property="foaf:name">Ben Adida</span>.
    	</span>
	</p>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/creator',
              '_:b'),
            quad('_:b',
              'http://xmlns.com/foaf/0.1/name',
              '"Ben Adida"'),
          ]);
      });

      it('chained rev and property', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
	</head>
  <body>
  	<p>
    	This paper was written by
    	<span rev="dc:creator">
      		<span property="foaf:name">Ben Adida</span>.
    	</span>
	</p>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b',
              'http://purl.org/dc/elements/1.1/creator',
              'http://example.org/'),
            quad('_:b',
              'http://xmlns.com/foaf/0.1/name',
              '"Ben Adida"'),
          ]);
      });

      it('multiple chained rel and property', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/
foaf: http://xmlns.com/foaf/0.1/">
	<head>
	</head>
  <body>
  	<p>
    	This paper was written by
    	<span rel="dc:creator dc:creator2">
      		<span property="foaf:name">Ben Adida</span>.
    	</span>
	</p>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/creator',
              '_:b'),
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/creator2',
              '_:b'),
            quad('_:b',
              'http://xmlns.com/foaf/0.1/name',
              '"Ben Adida"'),
          ]);
      });

      it('and ignore rel if there is a property and rel is a non-CURIE and non-URI', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rel="nofollow">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              'http://homepage.org/'),
          ]);
      });

      it('and not ignore rel if there is a property and rel is a non-CURIE and non-URI if ' +
        'features.onlyAllowUriRelRevIfProperty is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rel="follow">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              '"Some Body"'),
            quad('http://example.org/',
              'http://schema.org/follow',
              'http://homepage.org/'),
          ]);
      });

      it('and ignore rev if there is a property and rel is a non-CURIE and non-URI', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rev="nofollow">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              'http://homepage.org/'),
          ]);
      });

      it('and not ignore rel if there is a property and rel is a CURIE', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rel="schema:follow">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://example.org/',
              'http://schema.org/follow',
              'http://homepage.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              '"Some Body"'),
          ]);
      });

      it('and not ignore rel if there is a property and rel is a URI', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rel="http://example.org/follow">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://example.org/',
              'http://example.org/follow',
              'http://homepage.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              '"Some Body"'),
          ]);
      });

      it('and not ignore rev if there is a property and rev is a CURIE', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rev="schema:followedBy">Some Body</a>
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://homepage.org/',
              'http://schema.org/followedBy',
              'http://example.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              '"Some Body"'),
          ]);
      });

      it('and not ignore rev if there is a property and rev is a URI', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body>
  <p vocab="http://schema.org/">
    The homepage of <a href="http://homepage.org/" property="homepage" rev="http://example.org/followedBy">Some Body</a>
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://homepage.org/',
              'http://example.org/followedBy',
              'http://example.org/'),
            quad('http://example.org/',
              'http://schema.org/homepage',
              '"Some Body"'),
          ]);
      });

      it('unsetting vocab', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body vocab="http://schema.org/">
  <p vocab="">
    The homepage of <a property="homepage">Some Body</a>.
  </p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
          ]);
      });

      it('rel with one typeof child should have their blank node be connected', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
          ]);
      });

      it('complex blank node nesting', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p property="foaf:name">Dan Brickley</p>
	    <p typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
	<p property="foaf:name">Dan Brickley?</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b2'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley"'),
            quad('_:b2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley?"'),
          ]);
      });

      it('complex explicit blank node nesting', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p about="[_:]" property="foaf:name">Dan Brickley</p>
	    <p about="[_:]" typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
	<p about="[_:]" property="foaf:name">Dan Brickley?</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley"'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley?"'),
          ]);
      });

      it('complex partial explicit blank node nesting', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p property="foaf:name">Dan Brickley</p>
	    <p about="[_:]" typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
	<p about="[_:]" property="foaf:name">Dan Brickley?</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b2'),
            quad('_:b2',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley"'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley?"'),
          ]);
      });

      it('complex disconnected explicit blank node nesting', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p property="foaf:name">Dan Brickley</p>
	    <p typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
	<p about="[_:]" property="foaf:name">Dan Brickley?</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b2'),
            quad('_:b2',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley"'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('_:b3',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley?"'),
          ]);
      });

      it('complex connected explicit blank node nesting', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p property="foaf:name">Dan Brickley</p>
	    <p property="foaf:name">Dan Brickley again:-)</p>
	</div>
	<p about="[_:]" property="foaf:name">Dan Brickley?</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley"'),
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley again:-)"'),
            quad('_:b3',
              'http://xmlns.com/foaf/0.1/name',
              '"Dan Brickley?"'),
          ]);
      });

      it('blank node nesting with typeof', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div about="http://www.example.org/#somebody" rel="foaf:knows">
	    <p typeof="foaf:Person">Dan Brickley again:-)</p>
	</div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/#somebody',
              'http://xmlns.com/foaf/0.1/knows',
              '_:b1'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
          ]);
      });

      it('rdfa:Pattern without rdfa:copy', async () => {
        expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#muse',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/ns/rdfa#Pattern'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/name',
              '"Muse"'),
          ]);

        delete parser.rdfaPatterns['#muse'].text;
        delete parser.rdfaPatterns['#muse'].parentTag;
        expect(parser.rdfaPatterns).toEqual({
          '#muse': {
            attributes: {},
            children: [
              {
                attributes: {
                  href: 'Muse1.jpg',
                  property: 'schema:image',
                },
                children: [],
                name: 'link',
                referenced: false,
                rootPattern: false,
                text: [],
              },
              {
                attributes: {
                  href: 'Muse2.jpg',
                  property: 'schema:image',
                },
                children: [],
                name: 'link',
                referenced: false,
                rootPattern: false,
                text: [],
              },
              {
                attributes: {
                  href: 'Muse3.jpg',
                  property: 'schema:image',
                },
                children: [],
                name: 'link',
                referenced: false,
                rootPattern: false,
                text: [],
              },
              {
                attributes: {
                  property: 'schema:name',
                },
                children: [],
                name: 'span',
                referenced: false,
                rootPattern: false,
                text: [ 'Muse' ],
              },
            ],
            constructedBlankNodes: [],
            name: 'div',
            referenced: false,
            rootPattern: true,
          },
        });
      });

      it('rdfa:Pattern on root without rdfa:copy', async () => {
        expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/"
                                                resource="#muse" typeof="rdfa:Pattern">
  <head>
  </head>
  <body>
	<div>
	  <div>
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#muse',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/ns/rdfa#Pattern'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('http://example.org/#muse',
              'http://schema.org/name',
              '"Muse"'),
          ]);
      });

      it('rdfa:Pattern with one rdfa:copy with href', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('rdfa:Pattern with one rdfa:copy with resource', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" resource="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('rdfa:Pattern with one rdfa:copy with src', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" src="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('unreferenced rdfa:copy', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://www.w3.org/ns/rdfa#copy',
              'http://example.org/#muse'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('rdfa:Pattern with two rdfa:copy\'s', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united2">United Center, Chicago, Illinois 2</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),

            quad('_:b2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b2',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b2',
              'http://schema.org/location',
              'http://example.org/#united2'),
          ]);
      });

      it('rdfa:Pattern with blank node with two rdfa:copy\'s should only create a single blank node', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <div property="schema:refers-to" typeof="">
        <span property="schema:name">Muse</span>
      </div>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
    </p>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/refers-to',
              '_:b_shared'),
            quad('_:b_shared',
              'http://schema.org/name',
              '"Muse"'),

            quad('_:b2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b2',
              'http://schema.org/refers-to',
              '_:b_shared'),
          ]);
      });

      it('rdfa:Pattern with two rdfa:copy\'s before the pattern definition', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united2">United Center, Chicago, Illinois 2</a>
    </p>

    <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),

            quad('_:b2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b2',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b2',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b2',
              'http://schema.org/location',
              'http://example.org/#united2'),
          ]);
      });

      it('rdfa:Pattern with two rdfa:copy\'s next to each other', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('out-of-order rdfa:Pattern with one rdfa:copy', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>

	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('in-order nested rdfa:Pattern and rdfa:copy', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#name" typeof="rdfa:Pattern">
	    <span property="schema:name">Muse</span>
	  </div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <link property="rdfa:copy" href="#name"/>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('mixed order nested rdfa:Pattern and rdfa:copy', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <link property="rdfa:copy" href="#name"/>
    </div>
    <div resource="#name" typeof="rdfa:Pattern">
	    <span property="schema:name">Muse</span>
	  </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('and ignore rdfa:copy to self-referencing rdfa:Pattern', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
  </head>
  <body>
	<div>
	  <div resource="#muse" typeof="rdfa:Pattern">
      <link property="schema:image" href="Muse1.jpg"/>
      <link property="schema:image" href="Muse2.jpg"/>
      <link property="schema:image" href="Muse3.jpg"/>
      <span property="schema:name">Muse</span>
      <link property="rdfa:copy" href="#muse"/>
    </div>

    <p typeof="schema:MusicEvent">
      <link property="rdfa:copy" href="#muse"/>
      <a property="schema:location" href="#united">United Center, Chicago, Illinois</a>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/MusicEvent'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse1.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse2.jpg'),
            quad('_:b1',
              'http://schema.org/image',
              'http://example.org/Muse3.jpg'),
            quad('_:b1',
              'http://schema.org/name',
              '"Muse"'),
            quad('_:b1',
              'http://schema.org/location',
              'http://example.org/#united'),
          ]);
      });

      it('rdfa:copy via resource attribute', async () => {
        return expect(await parse(parser, `<html>
<head>
</head>
<body vocab="http://schema.org/">
  <div typeof="Person">
    <link property="rdfa:copy" resource="_:a"/>
  </div>
  <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="name">Amanda</span></p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Person'),
            quad('_:b1',
              'http://schema.org/name',
              '"Amanda"'),
          ]);
      });

      it('rdfa:copy and rdfa:Pattern are ignored when features.copyRdfaPatterns is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html>
<head>
</head>
<body vocab="http://schema.org/">
  <div typeof="Person">
    <link property="rdfa:copy" resource="_:a"/>
  </div>
  <p resource="_:a" typeof="rdfa:Pattern">Name: <span property="name">Amanda</span></p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://schema.org/Person'),
            quad('_:b1',
              'http://www.w3.org/ns/rdfa#copy',
              '_:b2'),
            quad('_:b2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/ns/rdfa#Pattern'),
            quad('_:b2',
              'http://schema.org/name',
              '"Amanda"'),
          ]);
      });

      it('typeof with a single property', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p about="" typeof="foaf:Document" property="foaf:topic">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              '"John Doe"'),
          ]);
      });

      it('typeof with a single property and resource', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" resource="http://example.org/res">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'http://example.org/res'),
          ]);
      });

      it('typeof with a single property and compact resource', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" resource="foaf:res">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://xmlns.com/foaf/0.1/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'http://xmlns.com/foaf/0.1/res'),
          ]);
      });

      it('typeof with a single property and href', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" href="http://example.org/href">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/href',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'http://example.org/href'),
          ]);
      });

      it('typeof with a single property and compact href', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" href="foaf:href">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('foaf:href',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'foaf:href'),
          ]);
      });

      it('typeof with a single property and src', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" src="http://example.org/src">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/src',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'http://example.org/src'),
          ]);
      });

      it('typeof with a single property and compact src', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
  <head>
		<title>Test 0051</title>
  </head>
  <body>
  	<p typeof="foaf:Document" property="foaf:topic" src="foaf:src">John Doe</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('foaf:src',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/topic',
              'foaf:src'),
          ]);
      });

      it('typeof on root tag without property and about', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/" typeof="foaf:Document">
  <head>
  </head>
  <body>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
          ]);
      });

      it('typeof on root tag with property and without about', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/"
property="foaf:name" typeof="foaf:Document">
  <head>
  </head>
  <body>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              'http://example.org/'),
          ]);
      });

      it('properties with inlist', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
      <a inlist="" property="dc:creator"
                   href="http://ben.adida.net/#me">Ben Adida</a>,
      <a inlist="" property="dc:creator"
                   href="http://twitter.com/markbirbeck">Mark Birbeck</a>, and
      <a inlist="" property="dc:creator"
                   href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://twitter.com/markbirbeck'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('properties with inlist and tag literals', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
      <a inlist="" property="dc:creator"
                   href="http://ben.adida.net/#me">Ben Adida</a>,
      <a inlist="" property="dc:creator">Mark Birbeck</a>, and
      <a inlist="" property="dc:creator"
                   href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Mark Birbeck"'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('properties with inlist and content literals', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
      <a inlist="" property="dc:creator"
                   href="http://ben.adida.net/#me">Ben Adida</a>,
      <a inlist="" property="dc:creator" content="Mark Birbeck">BlaBla</a>, and
      <a inlist="" property="dc:creator"
                   href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Mark Birbeck"'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('properties with inlist and datetime literals', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
      <a inlist="" property="dc:creator"
                   href="http://ben.adida.net/#me">Ben Adida</a>,
      <time inlist="" property="dc:creator" datetime="2018">BlaBla</time>, and
      <a inlist="" property="dc:creator"
                   href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"2018"^^http://www.w3.org/2001/XMLSchema#gYear'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('properties and rel with inlist and mixed values', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
      <a inlist="" rel="dc:creator"
                   href="http://ben.adida.net/#me">Ben Adida</a>,
      <a inlist="" property="dc:creator">Mark Birbeck</a>, and
      <a inlist="" rel="dc:creator"
                   href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Mark Birbeck"'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('inlist with incomplete triples', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
  	  <span rel="dc:creator" inlist="">
        <a href="http://ben.adida.net/#me">Ben Adida</a>,
        <a href="http://twitter.com/markbirbeck">Mark Birbeck</a>, and
        <a href="http://www.ivan-herman.net/foaf#me">Ivan Herman</a>.
      </span>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://ben.adida.net/#me'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://twitter.com/markbirbeck'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l3'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://www.ivan-herman.net/foaf#me'),
            quad('_:b_l3',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('an empty list', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
  	  <span rel="dc:creator" inlist=""></span>
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('a manual empty list', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p prefix="bibo: http://purl.org/ontology/bibo/ dc: http://purl.org/dc/terms/" typeof="bibo:Chapter">
  	  <span rel="dc:creator" resource="rdf:nil" />
    </p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://purl.org/ontology/bibo/Chapter'),
            quad('_:b1',
              'http://purl.org/dc/terms/creator',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('@rel and @inlist with decendent IRI elements creates list', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<div about="">
      <ol rel="rdf:value" inlist="">
        <li><a href="foo">Foo</a></li>
        <li><a href="bar">Bar</a></li>
      </ol>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://example.org/foo'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              '_:b_l2'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              'http://example.org/bar'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('@about and @inlist creates a separate list', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p about="res" property="rdf:value" inlist="">Bar</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Bar"'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('@about and @inlist create a separate lists', async () => {
        return expect(await parse(parser, `<html>
  <head>
  </head>
  <body>
  	<p about="res" property="rdf:value" inlist="">Bar</p>
  	<p about="res" property="rdf:value" inlist="">Foo</p>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l1'),
            quad('http://example.org/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l2'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Bar"'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Foo"'),
            quad('_:b_l2',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('@property and @resource with child @inlist', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0226</title>
</head>
<body prefix="ex: http://www.example.org/">
  <span property="ex:inlist" resource="res">
    <p property="rdf:value" inlist="">Bar</p>
  </span>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.example.org/inlist',
              'http://example.org/res'),
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Bar"'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('@rel and @resource with child @inlist', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0226</title>
</head>
<body prefix="ex: http://www.example.org/">
  <span rel="ex:inlist" resource="res">
    <p property="rdf:value" inlist="">Bar</p>
  </span>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.example.org/inlist',
              'http://example.org/res'),
            quad('http://example.org/res',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '_:b_l1'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
              '"Bar"'),
            quad('_:b_l1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('xmlns definition', async () => {
        return expect(await parse(parser, `<html xmlns:ex="http://example.org/" version="XHTML+RDFa 1.1">
   <head>
      <link rel="ex:next" href="http://rdfa.info/test-suite/test-cases/rdfa1.1/xhtml1/0062.xhtml" />
   </head>
   <body>
      <p>This is the first chapter in a series of chapters.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://example.org/next',
              'http://rdfa.info/test-suite/test-cases/rdfa1.1/xhtml1/0062.xhtml'),
          ]);
      });

      it('xmlns definition when features.xmlnsPrefixMappings is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html xmlns:ex="http://example.org/" version="XHTML+RDFa 1.1">
   <head>
      <link rel="ex:next" href="http://rdfa.info/test-suite/test-cases/rdfa1.1/xhtml1/0062.xhtml" />
   </head>
   <body>
      <p>This is the first chapter in a series of chapters.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'ex:next',
              'http://rdfa.info/test-suite/test-cases/rdfa1.1/xhtml1/0062.xhtml'),
          ]);
      });

      it('@about that resolves to nothing', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <div about="[]" property="foaf:name">Alex Milowski</div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
          ]);
      });

      it('@about that resolves to nothing with @typeof', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <div about="[]" typeof="foaf:Person" property="foaf:name">Alex Milowski</div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
            quad('_:b',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
          ]);
      });

      it('@about that resolves to nothing in object', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Test 0298: Testing @typeof and @about=[]</title>
</head>
<body>
  <div about="[]">
    <span property="foaf:name">Alex Milowski</span>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
          ]);
      });

      it('@about that resolves to nothing with child rel', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <div about="[]" property="foaf:name"><p rel="foaf:bla">Alex Milowski</p></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
          ]);
      });

      it('@about that resolves to nothing with child tag', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <div about="[]" property="foaf:name"><p>Alex Milowski</p></div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
          ]);
      });

      it('@about that resolves to nothing with child tag with property', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <div about="[]" property="foaf:name"><p property="foaf:firstName">Alex</p> Milowski</div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/firstName',
              '"Alex"'),
          ]);
      });

      it('no @about with @typeof', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Test 0298: Testing @typeof and @about=[]</title>
</head>
<body>
  <div typeof="foaf:Person">
    <span property="foaf:name">Alex Milowski</span>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
          ]);
      });

      it('@about that resolves to nothing in object with @typeof', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Test 0298: Testing @typeof and @about=[]</title>
</head>
<body>
  <div about="[]" typeof="foaf:Person">
    <span property="foaf:name">Alex Milowski</span>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b1',
              'http://xmlns.com/foaf/0.1/name',
              '"Alex Milowski"'),
            quad('_:b1',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
          ]);
      });

      it('standalone @href', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <a href="http://example.org/alex">Alex Milowski</a>
</body>
</html>`))
          .toBeRdfIsomorphic([]);
      });

      it('standalone @src', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>
  <img src="http://example.org/img" />
</body>
</html>`))
          .toBeRdfIsomorphic([]);
      });

      it('@resource with nested [] property', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
prefix="dc: http://purl.org/dc/elements/1.1/">
   <head>
   </head>
   <body>
    <div>
	<p about="https://mydomain.org/">
		<p resource="[]">
			<span property="dc:contributor">Shane McCarron</span>
			contributed to this test.
		</p>
	</p>
	</div>
   </body>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/contributor',
              '"Shane McCarron"'),
          ]);
      });

      it('@about and @resource with []', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
prefix="dc: http://purl.org/dc/elements/1.1/">
   <head>
   </head>
   <body>
    <div>
	<p about="https://mydomain.org/">
		<span about="[]" property="dc:title">Test Case 0121</span>
		checks to make sure RDFa processors resolve the empty CURIE correctly.
		<p resource="[]">
			<span property="dc:contributor">Shane McCarron</span>
			contributed to this test.
		</p>
	</p>
	</div>
   </body>`))
          .toBeRdfIsomorphic([
            quad('https://mydomain.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Test Case 0121"'),
            quad('http://example.org/',
              'http://purl.org/dc/elements/1.1/contributor',
              '"Shane McCarron"'),
          ]);
      });

      it('@resource with nested [] property in XML mode', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', profile: 'xml' });
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
prefix="dc: http://purl.org/dc/elements/1.1/">
   <head>
   </head>
   <body>
    <div>
	<p about="https://mydomain.org/">
		<p resource="[]">
			<span property="dc:contributor">Shane McCarron</span>
			contributed to this test.
		</p>
	</p>
	</div>
   </body>`))
          .toBeRdfIsomorphic([
            quad('https://mydomain.org/',
              'http://purl.org/dc/elements/1.1/contributor',
              '"Shane McCarron"'),
          ]);
      });

      it('@about and @resource with [] in XML mode', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', profile: 'xml' });
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml"
prefix="dc: http://purl.org/dc/elements/1.1/">
   <head>
   </head>
   <body>
    <div>
	<p about="https://mydomain.org/">
		<span about="[]" property="dc:title">Test Case 0121</span>
		checks to make sure RDFa processors resolve the empty CURIE correctly.
		<p resource="[]">
			<span property="dc:contributor">Shane McCarron</span>
			contributed to this test.
		</p>
	</p>
	</div>
   </body>`))
          .toBeRdfIsomorphic([
            quad('https://mydomain.org/',
              'http://purl.org/dc/elements/1.1/title',
              '"Test Case 0121"'),
            quad('https://mydomain.org/',
              'http://purl.org/dc/elements/1.1/contributor',
              '"Shane McCarron"'),
          ]);
      });

      it('@resource with [] is not allowed and resolved to nothing', async () => {
        return expect(await parse(parser, `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
   </head>
   <body>
    <p about="http://example.org/section1.html">
         This section is contained below <span rel="up" resource="[]">the main site</span>.
      </p>
   </body>
</html>`))
          .toBeRdfIsomorphic([]);
      });

      it('@typeof in <head>, and inherit parent object', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head typeof="foaf:Document">
      <title>Test 0066</title>
   </head>
   <body>
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
          ]);
      });

      it('@typeof in <body>, and inherit parent object', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document">
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
          ]);
      });

      it('@typeof and @property in <body>, and inherit parent object', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document" property="foaf:name">
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              'http://example.org/'),
          ]);
      });

      it('@typeof and @property in <body>, and not inherit parent object ' +
        'if features.inheritSubjectInHeadBody is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document" property="foaf:name">
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '_:b'),
            quad('_:b',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
          ]);
      });

      it('@typeof and @rel in <body>', async () => {
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document" rel="foaf:name">
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
          ]);
      });

      it('@typeof and @rel in <body> when features.inheritSubjectInHeadBody is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document" rel="foaf:name">
      <p>This is test #66.</p>
   </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Document'),
            quad('http://example.org/',
              'http://xmlns.com/foaf/0.1/name',
              '_:b'),
          ]);
      });

      it('should ignore invalid datatypes', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/terms/">
<head>
	<base href="http://www.example.org/me" />
</head>
<body>
  <p property="dc:language" datatype="pred/lang">JavaScript</p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/me',
              'http://purl.org/dc/terms/language',
              '"JavaScript"'),
          ]);
      });

      it('@property with no children should make empty literal', async () => {
        return expect(await parse(parser, `<html prefix="dc: http://purl.org/dc/elements/1.1/">
  <head>
    <title>Test 0257</title>
  </head>
  <body>
    <span about="#a" property="dc:title"></span>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#a',
              'http://purl.org/dc/elements/1.1/title',
              '""'),
          ]);
      });

      it('@about and empty @datatype should force string literal value', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0290</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <p about="http://example.org/" property="rdf:value" datatype="">value</p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value"'),
          ]);
      });

      it('@about and empty @datatype should force string literal value even with xmlns', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Test 0290</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <p about="http://example.org/" property="rdf:value" datatype="">value</p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value"'),
          ]);
      });

      it('@about and empty @datatype should force string literal value with sub-tags', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Test 0290</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <p about="http://example.org/" property="rdf:value" datatype="">value <em>bar</em></p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value bar"'),
          ]);
      });

      it('@href and empty @datatype should force string literal value', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0290</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <a href="http://example.org/" property="rdf:value" datatype="">value</a>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value"'),
          ]);
      });

      it('@href and empty @datatype should force string literal value with sub-tags', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0290</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <a href="http://example.org/" property="rdf:value" datatype="">value <em>bar</em></a>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value bar"'),
          ]);
      });

      it('rdf:HTML datatype and empty @datatype should nestable', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test dummy</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <div datatype="rdf:HTML" property="schema:description">
    <a href="http://example.org/" property="rdf:value" datatype="">value <em>bar</em></a>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value bar"'),
            quad('http://example.org/',
              'http://schema.org/description',
              '"\n    <a href="http://example.org/" property="rdf:value" datatype="">value <em>bar</em></a>\n  "^^http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'),
          ]);
      });

      it('rdf:HTML datatype and empty @datatype should nestable recursively', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test dummy</title>
</head>
<body>
  <h1>@href becomes subject when @property and @datatype are present</h1>
  <div datatype="rdf:HTML" property="schema:description">
    <a href="http://example.org/" property="rdf:value" datatype="">value <em>bar</em><div datatype="rdf:HTML" property="schema:description2"><a href="http://example.org/" property="rdf:value2" datatype="">value2 <em>bar2</em></a></div></a>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value2',
              '"value2 bar2"'),
            quad('http://example.org/',
              'http://schema.org/description2',
              '"<a href="http://example.org/" property="rdf:value2" datatype="">value2 <em>bar2</em></a>"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'),
            quad('http://example.org/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
              '"value barvalue2 bar2"'),
            quad('http://example.org/',
              'http://schema.org/description',
              '"\n    <a href="http://example.org/" property="rdf:value" datatype="">value <em>bar</em><div datatype="rdf:HTML" property="schema:description2"><a href="http://example.org/" property="rdf:value2" datatype="">value2 <em>bar2</em></a></div></a>\n  "^^http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'),
          ]);
      });

      it('@property does not set parent object without @typeof', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0296</title>
</head>
<body>
  <div vocab="http://xmlns.com/foaf/0.1/" resource="http://example.com/gregg/#me" typeof="Person">
    <a property="homepage" href="http://example.com/gregg/"><span property="name">Gregg</span></a>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://xmlns.com/foaf/0.1/'),
            quad('http://example.com/gregg/#me',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('http://example.com/gregg/#me',
              'http://xmlns.com/foaf/0.1/homepage',
              'http://example.com/gregg/'),
            quad('http://example.com/gregg/#me',
              'http://xmlns.com/foaf/0.1/name',
              '"Gregg"'),
          ]);
      });

      it('@property does set parent object with @typeof', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0296</title>
</head>
<body>
  <div vocab="http://xmlns.com/foaf/0.1/" resource="http://example.com/gregg/#me">
    <a property="homepage" href="http://example.com/gregg/" typeof="Person"><span property="name">Gregg</span></a>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://xmlns.com/foaf/0.1/'),
            quad('http://example.com/gregg/',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://xmlns.com/foaf/0.1/Person'),
            quad('http://example.com/gregg/#me',
              'http://xmlns.com/foaf/0.1/homepage',
              'http://example.com/gregg/'),
            quad('http://example.com/gregg/',
              'http://xmlns.com/foaf/0.1/name',
              '"Gregg"'),
          ]);
      });

      it('@resource that resolves to nothing should fallback to @href or @src', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0300: Testing @resource=[]</title>
</head>
<body about="http://www.example.org/">
  <a href="http://www.example.org/license.xhtml" property="xhv:license" resource="[]">The Foo Document</a>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://www.example.org/',
              'http://www.w3.org/1999/xhtml/vocab#license',
              'http://www.example.org/license.xhtml'),
          ]);
      });

      it('@rel should not do vocab expansion when another valid value is present', async () => {
        return expect(await parse(parser, `<html>
<head>
  <title>Test 0334: @resource changes the current subject for the nested elements</title>
</head>
<body>
  <div vocab="http://schema.org/" resource="http://example.org/base">
    <div resource="http://greggkellogg.net/#me">
      <p property="name" rel="homepage foaf:homepage" href="http://greggkellogg.net/">Gregg Kellogg</p>
    </div>
  </div>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/ns/rdfa#usesVocabulary',
              'http://schema.org/'),
            quad('http://greggkellogg.net/#me',
              'http://schema.org/name',
              '"Gregg Kellogg"'),
            quad('http://greggkellogg.net/#me',
              'http://xmlns.com/foaf/0.1/homepage',
              'http://greggkellogg.net/'),
          ]);
      });

      it('xml:base to set the baseIRI within the current scope', async () => {
        return expect(await parse(parser, `<?xml version="1.0" encoding="UTF-8"?>
<root width="12cm" height="4cm" viewBox="0 0 1200 400"
xml:base="http://example.com/"
xmlns:dc="http://purl.org/dc/terms/"
xmlns="http://www.w3.org/2000/svg">
     version="1.2"
     baseProfile="tiny"
  <desc property="dc:description">A yellow rectangle with sharp corners.</desc>
  <!-- Show outline of canvas using 'rect' element -->
  <rect x="1" y="1" width="1198" height="398"
        fill="none" stroke="blue" stroke-width="2"/>
  <rect x="400" y="100" width="400" height="200"
        fill="yellow" stroke="navy" stroke-width="10"  />
</root>`))
          .toBeRdfIsomorphic([
            quad('http://example.com/',
              'http://purl.org/dc/terms/description',
              '"A yellow rectangle with sharp corners."'),
          ]);
      });

      it('xml:base shoud not set the baseIRI outside the current scope', async () => {
        return expect(await parse(parser, `<?xml version="1.0" encoding="UTF-8"?>
<root width="12cm" height="4cm" viewBox="0 0 1200 400"
xmlns:dc="http://purl.org/dc/terms/"
xmlns="http://www.w3.org/2000/svg">
     version="1.2"
     baseProfile="tiny"
  <p xml:base="http://example.com/">abc</p>
  <desc property="dc:description">A yellow rectangle with sharp corners.</desc>
  <!-- Show outline of canvas using 'rect' element -->
  <rect x="1" y="1" width="1198" height="398"
        fill="none" stroke="blue" stroke-width="2"/>
  <rect x="400" y="100" width="400" height="200"
        fill="yellow" stroke="navy" stroke-width="10"  />
</root>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/terms/description',
              '"A yellow rectangle with sharp corners."'),
          ]);
      });

      it('xml:base not to set the baseIRI when features.xmlBase is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<?xml version="1.0" encoding="UTF-8"?>
<root width="12cm" height="4cm" viewBox="0 0 1200 400"
xml:base="http://example.com/"
xmlns:dc="http://purl.org/dc/terms/"
xmlns="http://www.w3.org/2000/svg">
     version="1.2"
     baseProfile="tiny"
  <desc property="dc:description">A yellow rectangle with sharp corners.</desc>
  <!-- Show outline of canvas using 'rect' element -->
  <rect x="1" y="1" width="1198" height="398"
        fill="none" stroke="blue" stroke-width="2"/>
  <rect x="400" y="100" width="400" height="200"
        fill="yellow" stroke="navy" stroke-width="10"  />
</root>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://purl.org/dc/terms/description',
              '"A yellow rectangle with sharp corners."'),
          ]);
      });

      it('should be able to ignore base tag and resolve relative IRIs against baseIRI', async () => {
        const features = { baseTag: false, xmlBase: true, xmlnsPrefixMappings: true };
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features });
        return expect(await parse(parser, `<?xml version="1.0" encoding="UTF-8"?>
<root>
<head>
  <base href="http://example.com/"/>
  <title>Test 0319</title>
</head>
<body prefix="pr: relative/iri#" xmlns:xpr="relative/uri#">
  <p property="pr:prop xpr:prop">value</p>
</body>
</root>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://example.org/relative/iri#prop',
              '"value"'),
            quad('http://example.org/',
              'http://example.org/relative/uri#prop',
              '"value"'),
          ]);
      });

      it('should be able to ignore base tag and resolve relative IRIs against baseIRI in HTML-mode', async () => {
        return expect(await parse(parser, `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <base href="http://example.com/"/>
  <title>Test 0319</title>
</head>
<body prefix="pr: relative/iri#" xmlns:xpr="relative/uri#">
  <p property="pr:prop xpr:prop">value</p>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.com/',
              'http://example.org/relative/iri#prop',
              '"value"'),
            quad('http://example.com/',
              'http://example.org/relative/uri#prop',
              '"value"'),
          ]);
      });

      it('should handle whitespace alternatives', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml" version="XHTML+RDFa 1.1"
prefix="xhv: http://www.w3.org/1999/xhtml/vocab#">
<head>
  <title>Test</title>
  <link rel="xhv:next&#x20;xhv:prev&#x09;xhv:first&#x0a;xhv:last&#x0d;xhv:subsection"
  href="http://example.org/test.css" />
</head>
<body>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#first',
              'http://example.org/test.css'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#last',
              'http://example.org/test.css'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#next',
              'http://example.org/test.css'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#prev',
              'http://example.org/test.css'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#subsection',
              'http://example.org/test.css'),
          ]);
      });

      it('should handle terms from the XHTML initial context', async () => {
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml" version="XHTML+RDFa 1.1">
<head>
  <title>Test 0259</title>
</head>
<body>
  <div>
    Vocabulary Terms
    <span property="alternate">alternate</span>
    <span property="appendix">appendix</span>
    <span property="cite">cite</span>
  </div>
</body></html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#alternate',
              '"alternate"'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#appendix',
              '"appendix"'),
            quad('http://example.org/',
              'http://www.w3.org/1999/xhtml/vocab#cite',
              '"cite"'),
          ]);
      });

      it('should handle terms from the XHTML initial context ' +
        'unless features.xhtmlInitialContext is disabled', async () => {
        parser = new RdfaParser({ baseIRI: 'http://example.org/', features: {} });
        return expect(await parse(parser, `<html xmlns="http://www.w3.org/1999/xhtml" version="XHTML+RDFa 1.1">
<head>
  <title>Test 0259</title>
</head>
<body>
  <div>
    Vocabulary Terms
    <span property="alternate">alternate</span>
    <span property="appendix">appendix</span>
    <span property="cite">cite</span>
  </div>
</body></html>`))
          .toBeRdfIsomorphic([]);
      });

      it('property with blank node values should be ignored', async () => {
        return expect(await parse(parser, `<html>
	<head>
	</head>
	<body>
	  <p property="_:b">Value ignored</p>
	</body>
</html>`))
          .toBeRdfIsomorphic([]);
      });

      it('role attribute with id', async () => {
        return expect(await parse(parser, `<html>
  <head>
		<title>Test 0305</title>
  </head>
  <body>
	<div id="heading1" role="heading">
      <p>Some contents that are a header</p>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#heading1',
              'http://www.w3.org/1999/xhtml/vocab#role',
              'http://www.w3.org/1999/xhtml/vocab#heading'),
          ]);
      });

      it('role attribute without id', async () => {
        return expect(await parse(parser, `<html>
  <head>
		<title>Test 0305</title>
  </head>
  <body>
	<div role="heading">
      <p>Some contents that are a header</p>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b',
              'http://www.w3.org/1999/xhtml/vocab#role',
              'http://www.w3.org/1999/xhtml/vocab#heading'),
          ]);
      });

      it('role attribute with multiple values', async () => {
        return expect(await parse(parser, `<html>
  <head>
		<title>Test 0305</title>
  </head>
  <body>
	<div id="heading1" role="heading1 heading2">
      <p>Some contents that are a header</p>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#heading1',
              'http://www.w3.org/1999/xhtml/vocab#role',
              'http://www.w3.org/1999/xhtml/vocab#heading1'),
            quad('http://example.org/#heading1',
              'http://www.w3.org/1999/xhtml/vocab#role',
              'http://www.w3.org/1999/xhtml/vocab#heading2'),
          ]);
      });

      it('role attribute with absolute IRI', async () => {
        return expect(await parse(parser, `<html>
  <head>
		<title>Test 0305</title>
  </head>
  <body>
	<div id="heading1" role="http://ex.org/heading">
      <p>Some contents that are a header</p>
    </div>
  </body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example.org/#heading1',
              'http://www.w3.org/1999/xhtml/vocab#role',
              'http://ex.org/heading'),
          ]);
      });

    });

  });

  describe('a default instance with an HTML listener', () => {

    let parser;
    let htmlParseListener;

    beforeEach(() => {
      htmlParseListener = {
        onEnd: jest.fn(),
        onTagClose: jest.fn(),
        onTagOpen: jest.fn(),
        onText: jest.fn(),
      };
      parser = new RdfaParser({ baseIRI: 'http://example.org/', htmlParseListener });
    });

    describe('should parse', () => {
      it('and call the HTML listener', async () => {
        expect(await parse(parser, `<html>
<head></head>
<body>
    <h2 about="http://example2.org/" property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('http://example2.org/', 'http://purl.org/dc/terms/title', '"The Trouble with Bob"'),
          ]);
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledTimes(4);
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledWith('html', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledWith('head', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledWith('body', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledWith('h2', {
          about: 'http://example2.org/',
          property: 'http://purl.org/dc/terms/title',
        });

        expect(htmlParseListener.onTagClose).toHaveBeenCalledTimes(4);

        expect(htmlParseListener.onText).toHaveBeenCalledTimes(6);
        expect(htmlParseListener.onText).toHaveBeenCalledWith('\n');
        expect(htmlParseListener.onText).toHaveBeenCalledWith('\n    ');
        expect(htmlParseListener.onText).toHaveBeenCalledWith('The Trouble with Bob');
        expect(htmlParseListener.onText).toHaveBeenCalledWith('\n');

        expect(htmlParseListener.onEnd).toHaveBeenCalledTimes(1);
      });
    });

  });

  describe('#import', () => {
    let parser;

    beforeAll(() => {
      parser = new RdfaParser({ baseIRI: 'http://example.org/' });
    });

    it('should parse a stream', async () => {
      const stream = streamifyString(`<html prefix="dc: http://purl.org/dc/elements/1.1/">
  <head>
    <title>Test 0257</title>
  </head>
  <body>
    <span about="#a" property="dc:title"></span>
  </body>
</html>`);
      return expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('http://example.org/#a',
          'http://purl.org/dc/elements/1.1/title',
          '""'),
      ]);
    });

    it('should parse another stream', async () => {
      const stream = streamifyString(`<html prefix="foaf: http://xmlns.com/foaf/0.1/">
   <head>
      <title>Test 0066</title>
   </head>
   <body typeof="foaf:Document" property="foaf:name">
      <p>This is test #66.</p>
   </body>
</html>`);
      return expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('http://example.org/',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          'http://xmlns.com/foaf/0.1/Document'),
        quad('http://example.org/',
          'http://xmlns.com/foaf/0.1/name',
          'http://example.org/'),
      ]);
    });

    it('should forward error events', async () => {
      const stream = new PassThrough();
      stream._read = () => stream.emit('error', new Error('my error'));
      return expect(arrayifyStream(parser.import(stream))).rejects.toThrow(new Error('my error'));
    });
  });
});

function parse(parser: RdfaParser, input: string): Promise<RDF.Quad[]> {
  return arrayifyStream(streamifyString(input).pipe(parser));
}
