import { PassThrough } from 'stream';
import type * as RDF from '@rdfjs/types';
import arrayifyStream from 'arrayify-stream';
import { DataFactory } from 'rdf-data-factory';
import 'jest-rdf';
import type { IHtmlParseListener } from '../lib/IHtmlParseListener';
import { MicrodataRdfParser } from '../lib/MicrodataRdfParser';

const quad = require('rdf-quad');
const streamifyString = require('streamify-string');

const DF = new DataFactory();

describe('MicrodataRdfParser', () => {
  it('should be constructable without args', () => {
    const instance = new MicrodataRdfParser();
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any>instance).util.baseIRI).toEqual('');
    expect((<any>instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with empty args', () => {
    const instance = new MicrodataRdfParser({});
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any>instance).util.baseIRI).toEqual('');
    expect((<any>instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with args with a custom data factory', () => {
    const dataFactory: any = { defaultGraph: () => 'abc', namedNode: () => DF.namedNode('abc') };
    const instance = new MicrodataRdfParser({ dataFactory });
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBe(dataFactory);
    expect((<any>instance).util.baseIRI).toEqual('');
    expect((<any>instance).defaultGraph).toBe('abc');
  });

  it('should be constructable with args with a custom base IRI', () => {
    const instance = new MicrodataRdfParser({ baseIRI: 'myBaseIRI' });
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any>instance).util.baseIRI).toEqual('myBaseIRI');
    expect((<any>instance).defaultGraph).toBe(DF.defaultGraph());
  });

  it('should be constructable with args with a custom default graph', () => {
    const defaultGraph = DF.namedNode('abc');
    const instance = new MicrodataRdfParser({ defaultGraph });
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBeInstanceOf(DataFactory);
    expect((<any>instance).util.baseIRI).toEqual('');
    expect((<any>instance).defaultGraph).toBe(defaultGraph);
  });

  it('should be constructable with args with a custom data factory, base IRI and default graph', () => {
    const dataFactory: any = { defaultGraph: () => 'abc', namedNode: () => DF.namedNode('abc') };
    const defaultGraph = DF.namedNode('abc');
    const instance = new MicrodataRdfParser({ dataFactory, baseIRI: 'myBaseIRI', defaultGraph });
    expect(instance).toBeInstanceOf(MicrodataRdfParser);
    expect((<any>instance).util.dataFactory).toBe(dataFactory);
    expect((<any>instance).util.baseIRI).toEqual('myBaseIRI');
    expect((<any>instance).defaultGraph).toBe(defaultGraph);
  });

  describe('a default instance', () => {
    let parser: MicrodataRdfParser;

    beforeEach(() => {
      parser = new MicrodataRdfParser({ baseIRI: 'http://example.org/document.html' });
    });

    describe('should error', () => {
      it('when an error is thrown in onTagClose', async() => {
        parser.onTagClose = () => {
          throw new Error('Dummy error');
        };
        await expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onTagOpen', async() => {
        parser.onTagOpen = () => {
          throw new Error('Dummy error');
        };
        await expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onText', async() => {
        parser.onText = () => {
          throw new Error('Dummy error');
        };
        await expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });

      it('when an error is thrown in onEnd', async() => {
        parser.onEnd = () => {
          throw new Error('Dummy error');
        };
        await expect(parse(parser, `<html>
<head></head>
<body>
    <h2 property="http://purl.org/dc/terms/title">The Trouble with Bob</h2>
</body>
</html>`)).rejects.toThrow(new Error('Dummy error'));
      });
    });

    describe('should parse', () => {
      describe('non-applicable documents', () => {
        it('an empty document', async() => {
          expect(await parse(parser, ``))
            .toBeRdfIsomorphic([]);
        });

        it('a document without item scopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span>
        <span itemprop="http://example.org/prop1">abc</span>
        <span itemprop="http://example.org/prop2">def</span>
        <span itemprop="http://example.org/prop3">ghi</span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });
      });

      describe('itemtype', () => {
        it('an itemscope with empty itemtype', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype=""></span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });

        it('an itemscope with relative itemtype', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="Invalid"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });

        it('an itemscope with itemtype', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
            ]);
        });

        it('an itemscope with itemtype and itemid', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span
    itemscope
    itemtype="http://example.org/Type"
    itemid="http://example.org/id"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/id',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Type'),
            ]);
        });

        it('an itemscope with itemtype and relative itemid', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span
    itemscope
    itemtype="http://example.org/Type"
    itemid="id"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/id',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Type'),
            ]);
        });

        it('an itemscope with itemtype and relative itemid when no baseIRI is provided', async() => {
          expect(await parse(new MicrodataRdfParser(), `<html>
<head></head>
<body>
    <span
    itemscope
    itemtype="http://example.org/Type"
    itemid="id"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
            ]);
        });

        it('an itemscope with itemtype and hash-relative itemid', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span
    itemscope
    itemtype="http://example.org/Type"
    itemid="#id"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/document.html#id',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Type'),
            ]);
        });

        it('an itemscope with itemtype containing multiple spaced values', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type1 http://example.org/Type2"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type1'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type2'),
            ]);
        });

        it('an itemscope with itemtype containing multiple tabbed values', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type1\thttp://example.org/Type2"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type1'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type2'),
            ]);
        });

        it('an itemscope with itemtype containing multiple newlined values', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type1
    http://example.org/Type2"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type1'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type2'),
            ]);
        });
      });

      describe('itemprop', () => {
        it('an itemscope with itemprop', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop without value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop"></span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '""'),
            ]);
        });

        it('an itemscope with itemprop with newlines', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop">

a

</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"\n\na\n\n"'),
            ]);
        });

        it('an itemscope with itemprop with sub-tags', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop">

<strong>
a
</strong>

</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"\n\n\na\n\n\n"'),
            ]);
        });

        it('an itemscope with space-separated itemprops', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop1 http://example.org/prop2">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '"abc"'),
              quad('_:b0', 'http://example.org/prop2', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop with relative URL', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type"><span itemprop="prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
              quad('_:b0', 'http://example.org/prop', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop with relative URL to a hash vocab', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org#Type"><span itemprop="prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org#Type'),
              quad('_:b0', 'http://example.org#prop', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop with relative URL without vocab', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/document.html#prop', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop with relative URL and itemid', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type" itemid="http://example.org/id"><span itemprop="prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/id',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Type'),
              quad('http://example.org/id', 'http://example.org/prop', '"abc"'),
            ]);
        });

        it('an itemscope with itemprop and newlines surrounding the prop tag', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop">abc</span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"abc"'),
            ]);
        });

        it('an itemscope with multiple itemprops', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1">abc</span>
        <span itemprop="http://example.org/prop2">def</span>
        <span itemprop="http://example.org/prop3">ghi</span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '"abc"'),
              quad('_:b0', 'http://example.org/prop2', '"def"'),
              quad('_:b0', 'http://example.org/prop3', '"ghi"'),
            ]);
        });

        it('an itemscope with itemprop with relative URL for hcard', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://microformats.org/profile/hcard"><span itemprop="prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://microformats.org/profile/hcard'),
              quad('_:b0', 'http://microformats.org/profile/hcard#prop', '"abc"'),
            ]);
        });
      });

      describe('itemprop-reverse', () => {
        it('an itemscope with itemprop-reverse with string value should be ignored', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop-reverse="http://example.org/prop">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });

        it('an itemscope with itemprop-reverse with nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop-reverse="http://example.org/prop1" itemscope itemid="http://example.org/sub"></span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/sub', 'http://example.org/prop1', '_:b0'),
            ]);
        });

        it('an itemscope with itemprop and itemprop-reverse with nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop" itemprop-reverse="http://example.org/propRev" itemscope itemid="http://example.org/sub"></span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://example.org/sub'),
              quad('http://example.org/sub', 'http://example.org/propRev', '_:b0'),
            ]);
        });

        it('an itemscope with itemprop-reverse with string value should be ignored, but not itemprop', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop" itemprop-reverse="http://example.org/propRev">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"abc"'),
            ]);
        });
      });

      describe('special itemprops', () => {
        it('an itemscope with itemprop and content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop" content="def"></span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"def"'),
            ]);
        });

        it('an itemscope with itemprop and content, and ignores text node values', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span itemprop="http://example.org/prop" content="def">abc</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"def"'),
            ]);
        });

        it('an itemscope with itemprop and a', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><a itemprop="http://example.org/prop" href="http://ex.org/link"></a></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and a with relative value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://schema.org/"><a itemprop="http://example.org/prop" href="link"></a></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/'),
              quad('_:b0', 'http://example.org/prop', 'http://example.org/link'),
            ]);
        });

        it('an itemscope with itemprop and a and missing href', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><a itemprop="http://example.org/prop"></a></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '""'),
            ]);
        });

        it('an itemscope with itemprop and area', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><area itemprop="http://example.org/prop" href="http://ex.org/link"></area></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and audio', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><audio itemprop="http://example.org/prop" src="http://ex.org/link"></audio></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and embed', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><embed itemprop="http://example.org/prop" src="http://ex.org/link"></embed></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and iframe', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><iframe itemprop="http://example.org/prop" src="http://ex.org/link"></iframe></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and img', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><img itemprop="http://example.org/prop" src="http://ex.org/link"></img></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and link', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><link itemprop="http://example.org/prop" href="http://ex.org/link"></link></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and object', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><object itemprop="http://example.org/prop" data="http://ex.org/link"></object></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and source', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><source itemprop="http://example.org/prop" src="http://ex.org/link"></source></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and track', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><track itemprop="http://example.org/prop" src="http://ex.org/link"></track></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and video', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><video itemprop="http://example.org/prop" src="http://ex.org/link"></video></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', 'http://ex.org/link'),
            ]);
        });

        it('an itemscope with itemprop and integer data', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><data itemprop="http://example.org/prop" value="123"></data></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"123"^^http://www.w3.org/2001/XMLSchema#integer'),
            ]);
        });

        it('an itemscope with itemprop and double data', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><data itemprop="http://example.org/prop" value="123.321"></data></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"123.321"^^http://www.w3.org/2001/XMLSchema#double'),
            ]);
        });

        it('an itemscope with itemprop and string data', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><data itemprop="http://example.org/prop" value="not 123"></data></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"not 123"'),
            ]);
        });

        it('an itemscope with itemprop and integer meter', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><meter itemprop="http://example.org/prop" value="123"></meter></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"123"^^http://www.w3.org/2001/XMLSchema#integer'),
            ]);
        });

        it('an itemscope with itemprop and double meter', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><meter itemprop="http://example.org/prop" value="123.321"></meter></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"123.321"^^http://www.w3.org/2001/XMLSchema#double'),
            ]);
        });

        it('an itemscope with itemprop and string meter', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><meter itemprop="http://example.org/prop" value="not 123"></meter></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"not 123"'),
            ]);
        });
      });

      describe('time', () => {
        it('an itemscope with time and time value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="00:00:00Z"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"00:00:00Z"^^http://www.w3.org/2001/XMLSchema#time'),
            ]);
        });

        it('an itemscope with time and no datetime value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop">a</time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"a"'),
            ]);
        });

        it('an itemscope with time and datetime value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="2012-03-18T00:00:00"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0',
                'http://example.org/prop',
                '"2012-03-18T00:00:00"^^http://www.w3.org/2001/XMLSchema#dateTime'),
            ]);
        });

        it('an itemscope with time and date value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="2012-03-18"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"2012-03-18"^^http://www.w3.org/2001/XMLSchema#date'),
            ]);
        });

        it('an itemscope with time and full duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P2Y6M5DT12H35M30S"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P2Y6M5DT12H35M30S"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and day and hour duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P1DT2H"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P1DT2H"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and month duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P20M"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P20M"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and minute duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="PT20M"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"PT20M"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and duration with optional 0s value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P0Y20M0D"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P0Y20M0D"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and 0 year duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P0Y"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P0Y"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and minus 60 days duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="-P60D"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"-P60D"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and decimal seconds duration value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="PT1M30.5S"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"PT1M30.5S"^^http://www.w3.org/2001/XMLSchema#duration'),
            ]);
        });

        it('an itemscope with time and invalid durations without T', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P1M30.5S"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P1M30.5S"'),
            ]);
        });

        it('an itemscope with time and invalid durations with unknown character', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><time itemprop="http://example.org/prop" datetime="P2X6M5DT12H35M30S"></time></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"P2X6M5DT12H35M30S"'),
            ]);
        });
      });

      describe('language', () => {
        it('an itemscope+lang with itemprop with content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope lang="en"><span itemprop="http://example.org/prop" content="a">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"a"@en'),
            ]);
        });

        it('an itemscope+xml:lang with itemprop with content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope xml:lang="en"><span itemprop="http://example.org/prop" content="a">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"a"@en'),
            ]);
        });

        it('an itemscope with itemprop+lang with content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span lang="en" itemprop="http://example.org/prop" content="a">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"a"@en'),
            ]);
        });

        it('an itemscope with itemprop+xml:lang with content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span xml:lang="en" itemprop="http://example.org/prop" content="a">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"a"@en'),
            ]);
        });

        it('an itemscope+lang with itemprop with value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope lang="en"><span itemprop="http://example.org/prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"b"@en'),
            ]);
        });

        it('an itemscope+xml:lang with itemprop with value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope xml:lang="en"><span itemprop="http://example.org/prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"b"@en'),
            ]);
        });

        it('an itemscope with itemprop+lang with value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span lang="en" itemprop="http://example.org/prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"b"@en'),
            ]);
        });

        it('an itemscope with itemprop+xml:lang with value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope><span xml:lang="en" itemprop="http://example.org/prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop', '"b"@en'),
            ]);
        });
      });

      describe('nested itemscope', () => {
        it('an itemscope with itemprop without nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1">
            <span itemprop="http://example.org/prop2">b</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '"\n            b\n        "'),
              quad('_:b0', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with itemprop with nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1" itemscope>
            <span itemprop="http://example.org/prop2">b</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '_:b1'),
              quad('_:b1', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with itemprop with anonymous nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1"><span itemprop="http://example.org/prop2" itemscope>b</span></span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '"b"'),
              quad('_:b0', 'http://example.org/prop2', '_:b1'),
            ]);
        });

        it('an itemscope with itemprop with nested itemscope with inner content value', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1" itemscope>
            <span itemprop="http://example.org/prop2" content="b">ignored</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '_:b1'),
              quad('_:b1', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with itemprop with deeply nested itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1" itemscope>
            <span itemprop="http://example.org/prop2" itemscope>
                <span itemprop="http://example.org/prop3">b</span>
            </span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '_:b1'),
              quad('_:b1', 'http://example.org/prop2', '_:b2'),
              quad('_:b2', 'http://example.org/prop3', '"b"'),
            ]);
        });

        it('an itemscope with itemprop with nested itemscope should ignore direct content', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1" itemscope content="ignored">
            <span itemprop="http://example.org/prop2">b</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1', '_:b1'),
              quad('_:b1', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with itemprop with multiple nested itemscopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1.1" itemscope>
            <span itemprop="http://example.org/prop1.2">b.1</span>
        </span>
        <span itemprop="http://example.org/prop2.1" itemscope>
            <span itemprop="http://example.org/prop2.2">b.2</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://example.org/prop1.1', '_:b1.1'),
              quad('_:b1.1', 'http://example.org/prop1.2', '"b.1"'),
              quad('_:b0', 'http://example.org/prop2.1', '_:b2.1'),
              quad('_:b2.1', 'http://example.org/prop2.2', '"b.2"'),
            ]);
        });

        it('an itemscope with itemprop with nested itemscope and vocab inheritance', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://schema.org/Person">
        <span itemprop="prop1" itemscope>
            <span itemprop="prop2">b</span>
        </span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
              quad('_:b0', 'http://schema.org/prop1', '_:b1'),
              quad('_:b1', 'http://schema.org/prop2', '"b"'),
            ]);
        });
      });

      describe('itemref', () => {
        it('an itemscope with one forward itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a">Name: <span itemprop="prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with one backward itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">b</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with an itemref without range', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
            ]);
        });

        it('an itemscope with an itemref without domain', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });

        it('an itemscope with empty itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref=""></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
            ]);
        });

        it('an itemscope with two forward itemrefs', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a b"></span>
    <span id="a">Name: <span itemprop="prop">a</span></span>
    <span id="b">Name: <span itemprop="prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"a"'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with two backward itemrefs', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">a</span></span>
    <span id="b">Name: <span itemprop="prop">b</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a b"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"a"'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with one forward and one backward itemrefs', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">a</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a b"></span>
    <span id="b">Name: <span itemprop="prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"a"'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with one forward itemref with itemprop on id', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a" itemprop="prop">Name: <span>b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"Name: b"'),
            ]);
        });

        it('an itemscope with one backward itemref with itemprop on id', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop">Name: <span>b</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"Name: b"'),
            ]);
        });

        it('an itemscope with one forward itemref multiple itemprops', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a" itemprop="prop1">Name: <span itemprop="prop2">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop1', '"Name: b"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with one backward itemref multiple itemprops', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop1">Name: <span itemprop="prop2">b</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop1', '"Name: b"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with an itemref refering to an inner tag', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a">
        <span id="a" itemprop="prop">a</span>
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"a"'),
            ]);
        });

        it('an itemscope with one forward nested itemref with itemprop on id', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a b"></span>
    <span id="a" itemprop="prop1">Name: <span id="b" itemprop="prop2">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop1', '"Name: b"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with one backward nested itemref with itemprop on id', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop1">Name: <span id="b" itemprop="prop2">b</span></span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a b"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop1', '"Name: b"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with multiple scopes pointing to same forward itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject1" itemtype="http://example.org/Person" itemref="a"></span>
    <span itemscope itemid="http://example.org/subject2" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a">Name: <span itemprop="prop">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '"b"'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with multiple scopes pointing to same backward itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">b</span></span>
    <span itemscope itemid="http://example.org/subject1" itemtype="http://example.org/Person" itemref="a"></span>
    <span itemscope itemid="http://example.org/subject2" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '"b"'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with multiple scopes pointing to same intermediary itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject1" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a">Name: <span itemprop="prop">b</span></span>
    <span itemscope itemid="http://example.org/subject2" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '"b"'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '"b"'),
            ]);
        });

        it('an itemscope with one forward itemref to itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemref="a" itemtype="http://example.org/Person"></span>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson">Name: <span itemprop="prop2">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with one backward itemref to itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson">Name: <span itemprop="prop2">b</span></span>
    <span itemscope itemid="http://example.org/subject" itemref="a" itemtype="http://example.org/Person"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with one forward itemref to deeper itemscopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemref="a" itemtype="http://example.org/Person"></span>
    <span id="a" itemprop="prop">Name: <span itemprop="prop2" itemscope>b</span> <span itemprop="prop3" itemscope>c</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject', 'http://example.org/prop3', '_:b'),
            ]);
        });

        it('an itemscope with one backward itemref to deeper itemscopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop">Name: <span itemprop="prop2" itemscope>b</span> <span itemprop="prop3" itemscope>c</span></span>
    <span itemscope itemid="http://example.org/subject" itemref="a" itemtype="http://example.org/Person"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject', 'http://example.org/prop3', '_:b'),
            ]);
        });

        it('an itemscope with two forward itemrefs to the same itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject1" itemref="a" itemtype="http://example.org/Person"></span>
    <span itemscope itemid="http://example.org/subject2" itemref="a" itemtype="http://example.org/Person"></span>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson">Name: <span itemprop="prop2">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '_:b'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with two backward itemrefs to the same itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson">Name: <span itemprop="prop2">b</span></span>
    <span itemscope itemid="http://example.org/subject1" itemref="a" itemtype="http://example.org/Person"></span>
    <span itemscope itemid="http://example.org/subject2" itemref="a" itemtype="http://example.org/Person"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '_:b'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with two forward itemrefs to the same deeper itemscopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject1" itemref="a" itemtype="http://example.org/Person"></span>
    <span itemscope itemid="http://example.org/subject2" itemref="a" itemtype="http://example.org/Person"></span>
    <span id="a" itemprop="prop">Name: <span itemprop="prop2" itemscope>b</span> <span itemprop="prop3" itemscope>c</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject1', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject1', 'http://example.org/prop3', '_:b'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject2', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject2', 'http://example.org/prop3', '_:b'),
            ]);
        });

        it('an itemscope with two backward itemrefs to the same deeper itemscopes', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop">Name: <span itemprop="prop2" itemscope>b</span> <span itemprop="prop3" itemscope>c</span></span>
    <span itemscope itemid="http://example.org/subject1" itemref="a" itemtype="http://example.org/Person"></span>
    <span itemscope itemid="http://example.org/subject2" itemref="a" itemtype="http://example.org/Person"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject1',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject1', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject1', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject1', 'http://example.org/prop3', '_:b'),
              quad('http://example.org/subject2',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject2', 'http://example.org/prop', '"Name: b c"'),
              quad('http://example.org/subject2', 'http://example.org/prop2', '_:a'),
              quad('http://example.org/subject2', 'http://example.org/prop3', '_:b'),
            ]);
        });

        it('an itemscope with an id with deeper itemscopes without itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a" itemprop="prop">Name: <span itemprop="prop2" itemscope>b</span> <span itemprop="prop3" itemscope>c</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([]);
        });

        it('an itemscope with a self-recursive itemref', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="a">Name: <span itemprop="prop">b
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
    </span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '"b\n    \n    "'),
            ]);
        });

        it('an itemscope with a chained forward itemref to itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson" itemref="b">a</span>
    <span id="b">Name: <span itemprop="prop2">b</span></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });

        it('an itemscope with a chained backward itemref to itemscope', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span id="b">Name: <span itemprop="prop2">b</span></span>
    <span id="a" itemprop="prop" itemscope itemtype="http://example2.org/SubPerson" itemref="b">a</span>
    <span itemscope itemid="http://example.org/subject" itemtype="http://example.org/Person" itemref="a"></span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('http://example.org/subject',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example.org/Person'),
              quad('http://example.org/subject', 'http://example.org/prop', '_:b'),
              quad('_:b',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                'http://example2.org/SubPerson'),
              quad('_:b', 'http://example2.org/prop2', '"b"'),
            ]);
        });
      });

      describe('vocabulary expansion', () => {
        it('for subPropertyOf for vocab not in registry', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Person">
        <link itemprop="subPropertyOf" href="http://example.org/Human" />
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Person'),
              quad('_:b0', 'http://example.org/subPropertyOf', 'http://example.org/Human'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Human'),
            ]);
        });

        it('for equivalentProperty for vocab not in registry', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Person">
        <link itemprop="equivalentProperty" href="http://example.org/Human" />
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Person'),
              quad('_:b0', 'http://example.org/equivalentProperty', 'http://example.org/Human'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Human'),
            ]);
        });

        it('for subPropertyOf for vocab not in registry on itemprop-reverse', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Person">
        <link itemprop-reverse="subPropertyOf" href="http://example.org/Human" />
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Person'),
              quad('http://example.org/Human', 'http://example.org/subPropertyOf', '_:b0'),
              quad('http://example.org/Human', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '_:b0'),
            ]);
        });

        it('for indirect subPropertyOf for vocab in registry', async() => {
          expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope itemtype="http://schema.org/Person">
        <link itemprop="additionalType" href="http://schema.org/Human" />
    </span>
</body>
</html>`))
            .toBeRdfIsomorphic([
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person'),
              quad('_:b0', 'http://schema.org/additionalType', 'http://schema.org/Human'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Human'),
            ]);
        });
      });
    });
  });

  describe('a default instance with an HTML listener', () => {
    let parser: MicrodataRdfParser;
    let htmlParseListener: IHtmlParseListener;

    beforeEach(() => {
      htmlParseListener = {
        onEnd: jest.fn(),
        onTagClose: jest.fn(),
        onTagOpen: jest.fn(),
        onText: jest.fn(),
      };
      parser = new MicrodataRdfParser({ baseIRI: 'http://example.org/', htmlParseListener });
    });

    describe('should parse', () => {
      it('and call the HTML listener', async() => {
        expect(await parse(parser, `<html>
<head></head>
<body>
    <span itemscope>
        <span itemprop="http://example.org/prop1">abc</span>
        <span itemprop="http://example.org/prop2">def</span>
        <span itemprop="http://example.org/prop3">ghi</span>
    </span>
</body>
</html>`))
          .toBeRdfIsomorphic([
            quad('_:b0', 'http://example.org/prop1', '"abc"'),
            quad('_:b0', 'http://example.org/prop2', '"def"'),
            quad('_:b0', 'http://example.org/prop3', '"ghi"'),
          ]);
        expect(htmlParseListener.onTagOpen).toHaveBeenCalledTimes(7);
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(1, 'html', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(2, 'head', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(3, 'body', {});
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(4, 'span', {
          itemscope: '',
        });
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(5, 'span', {
          itemprop: 'http://example.org/prop1',
        });
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(6, 'span', {
          itemprop: 'http://example.org/prop2',
        });
        expect(htmlParseListener.onTagOpen).toHaveBeenNthCalledWith(7, 'span', {
          itemprop: 'http://example.org/prop3',
        });

        expect(htmlParseListener.onTagClose).toHaveBeenCalledTimes(7);

        expect(htmlParseListener.onText).toHaveBeenCalledTimes(12);
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(1, '\n');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(2, '\n');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(3, '\n    ');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(4, '\n        ');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(5, 'abc');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(6, '\n        ');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(7, 'def');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(8, '\n        ');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(9, 'ghi');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(10, '\n    ');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(11, '\n');
        expect(htmlParseListener.onText).toHaveBeenNthCalledWith(12, '\n');

        expect(htmlParseListener.onEnd).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#import', () => {
    let parser: MicrodataRdfParser;

    beforeAll(() => {
      parser = new MicrodataRdfParser({ baseIRI: 'http://example.org/' });
    });

    it('should parse a stream', async() => {
      const stream = streamifyString(`<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type"></span>
</body>
</html>`);
      expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
      ]);
    });

    it('should parse another stream', async() => {
      const stream = streamifyString(`<html>
<head></head>
<body>
    <span itemscope itemtype="http://example.org/Type"></span>
</body>
</html>`);
      expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://example.org/Type'),
      ]);
    });

    it('should forward error events', async() => {
      const stream = new PassThrough();
      stream._read = () => stream.emit('error', new Error('my error'));
      await expect(arrayifyStream(parser.import(stream))).rejects.toThrow(new Error('my error'));
    });
  });
});

function parse(parser: MicrodataRdfParser, input: string): Promise<RDF.Quad[]> {
  return arrayifyStream(streamifyString(input).pipe(parser));
}
