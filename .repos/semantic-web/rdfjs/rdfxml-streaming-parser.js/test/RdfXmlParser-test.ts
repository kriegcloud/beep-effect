import "jest-rdf";
import * as RDF from "@rdfjs/types";
import {SaxesParser} from "@rubensworks/saxes";
import {PassThrough} from "stream";
import {RdfXmlParser} from "../lib/RdfXmlParser";
import {DataFactory} from "rdf-data-factory";
const streamifyString = require('streamify-string');
import { streamifyArray } from 'streamify-array';
import { arrayifyStream } from 'arrayify-stream';
import {IriValidationStrategy} from "validate-iri";
const quad = require('rdf-quad');
const DF = new DataFactory();

/* Test inspired by https://www.w3.org/TR/rdf-syntax-grammar/#section-Syntax-intro */
/* (Some) tests are tagged with the section they apply to  */

describe('RdfXmlParser', () => {
  it('MIME_TYPE to be \'application/rdf+xml\'', () => {
    expect(RdfXmlParser.MIME_TYPE).toEqual('application/rdf+xml');
  });

  it('should be constructable without args', () => {
    const instance = new RdfXmlParser();
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).baseIRI).toBe('');
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
    expect((<any> instance).validateUri).toBeTruthy();
    expect((<any> instance).iriValidationStrategy).toEqual(IriValidationStrategy.Pragmatic);
  });

  it('should be constructable with empty args', () => {
    const instance = new RdfXmlParser({});
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).baseIRI).toBe('');
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
    expect((<any> instance).validateUri).toBeTruthy();
    expect((<any> instance).iriValidationStrategy).toEqual(IriValidationStrategy.Pragmatic);
  });

  it('should be constructable with args with a custom data factory', () => {
    const dataFactory: any = { defaultGraph: () => 'abc' };
    const instance = new RdfXmlParser({ dataFactory });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBe(dataFactory);
    expect((<any> instance).baseIRI).toBe('');
    expect((<any> instance).defaultGraph).toBe('abc');
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
  });

  it('should be constructable with args with a custom base IRI', () => {
    const instance = new RdfXmlParser({ baseIRI: 'myBaseIRI' });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).baseIRI).toEqual('myBaseIRI');
    expect((<any> instance).defaultGraph).toBe(DF.defaultGraph());
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
  });

  it('should be constructable with args with a custom default graph', () => {
    const defaultGraph = DF.namedNode('abc');
    const instance = new RdfXmlParser({ defaultGraph });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBeInstanceOf(DataFactory);
    expect((<any> instance).baseIRI).toEqual('');
    expect((<any> instance).defaultGraph).toBe(defaultGraph);
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
  });

  it('should be constructable with args with a custom data factory and default graph', () => {
    const dataFactory: any = { defaultGraph: () => 'abc' };
    const defaultGraph = DF.namedNode('abc');
    const instance = new RdfXmlParser({ dataFactory, baseIRI: 'myBaseIRI', defaultGraph });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).dataFactory).toBe(dataFactory);
    expect((<any> instance).baseIRI).toEqual('myBaseIRI');
    expect((<any> instance).defaultGraph).toBe(defaultGraph);
    expect((<any> instance).saxParser).toBeInstanceOf(SaxesParser);
  });

  it('should be constructible with args with disabled validateUri', () => {
    const instance = new RdfXmlParser({ validateUri: false });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).validateUri).toBeFalsy();
    expect((<any> instance).iriValidationStrategy).toEqual(IriValidationStrategy.None);
  });

  it('should be constructible with args with iriValidationStrategy', () => {
    const instance = new RdfXmlParser({ iriValidationStrategy: IriValidationStrategy.Pragmatic });
    expect(instance).toBeInstanceOf(RdfXmlParser);
    expect((<any> instance).iriValidationStrategy).toEqual(IriValidationStrategy.Pragmatic);
  });

  describe('a default instance', () => {
    let parser: any;

    beforeEach(() => {
      parser = new RdfXmlParser();
    });

    it('should delegate xml errors', () => {
      return expect(parse(new RdfXmlParser(), `
abc`)).rejects.toBeTruthy();
    });

    describe('#valueToUri', () => {

      it('create a named node from an absolute URI when no baseIRI is given', () => {
        expect(parser.valueToUri('http://example.org/', {}))
          .toEqual(DF.namedNode('http://example.org/'));
      });

      it('create a named node from an absolute URI when the baseIRI is empty', () => {
        expect(parser.valueToUri('http://example.org/', { baseIRI: '' }))
          .toEqual(DF.namedNode('http://example.org/'));
      });

      it('create a named node from an absolute URI when a baseIRI is given', () => {
        expect(parser.valueToUri('http://example.org/', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http://example.org/'));
      });

      it('create a named node from the baseIRI when given value is empty', () => {
        expect(parser.valueToUri('', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http://base.org/'));
      });

      it('throw an error on a relative URI when no baseIRI is given', () => {
        expect(() => parser.valueToUri('abc', {}))
          .toThrow(new Error('Found invalid relative IRI \'abc\' for a missing baseIRI'));
      });

      it('create error on a URI with an invalid scheme', () => {
        expect(() => parser.valueToUri('%https://example.com/', {}))
          .toThrow(new Error('Invalid IRI according to RDF Turtle: \'%https://example.com/\''));
      });

      it('create error on a URI with an invalid character', () => {
        expect(() => parser.valueToUri('https://example.com/<', {}))
          .toThrow(new Error('Invalid IRI according to RDF Turtle: \'https://example.com/<\''));
      });

      it('create a named node from a relative URI when a baseIRI is given', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http://base.org/abc'));
      });

      it('create a named node from a relative URI when a baseIRI is given and ignore the baseIRI fragment', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http://base.org/#frag' }))
          .toEqual(DF.namedNode('http://base.org/abc'));
      });

      it('create a named node from a hash', () => {
        expect(parser.valueToUri('#abc', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http://base.org/#abc'));
      });

      it('create a named node and ignore the baseIRI if the value contains a colon', () => {
        expect(parser.valueToUri('http:abc', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http:abc'));
      });

      it('error for a non-absolute baseIRI', () => {
        expect(() => parser.valueToUri('abc', { baseIRI: 'def' })).toThrow();
      });

      it('create a named node that has the baseIRI scheme if the value starts with //', () => {
        expect(parser.valueToUri('//abc', { baseIRI: 'http://base.org/' }))
          .toEqual(DF.namedNode('http://abc'));
      });

      it('create a named node from a baseIRI without a / in the path', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http://base.org' }))
          .toEqual(DF.namedNode('http://base.org/abc'));
      });

      it('create a named node from the baseIRI scheme when the baseIRI contains only ://', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http://' }))
          .toEqual(DF.namedNode('http:abc'));
      });

      it('create a named node from the baseIRI if something other than a / follows the :', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http:a' }))
          .toEqual(DF.namedNode('http:abc'));
      });

      it('create a named node from the baseIRI scheme if nothing follows the :', () => {
        expect(parser.valueToUri('abc', { baseIRI: 'http:' }))
          .toEqual(DF.namedNode('http:abc'));
      });

      it('create a named node from an absolute path and ignore the path from the base IRI', () => {
        expect(parser.valueToUri('/abc/def/', { baseIRI: 'http://base.org/123/456/' }))
          .toEqual(DF.namedNode('http://base.org/abc/def/'));
      });

      it('create a named node from a baseIRI with http:// and ignore everything after the last slash', () => {
        expect(parser.valueToUri('xyz', { baseIRI: 'http://aa/a' }))
          .toEqual(DF.namedNode('http://aa/xyz'));
      });

      it('create a named node from a baseIRI with http:// and collapse parent paths', () => {
        expect(parser.valueToUri('xyz', { baseIRI: 'http://aa/parent/parent/../../a' }))
          .toEqual(DF.namedNode('http://aa/xyz'));
      });

      it('create a named node from a baseIRI with http:// and remove current-dir paths', () => {
        expect(parser.valueToUri('xyz', { baseIRI: 'http://aa/././a' }))
          .toEqual(DF.namedNode('http://aa/xyz'));
      });
    });

    describe('should error with line numbers', () => {

      beforeEach(() => {
        parser = new RdfXmlParser({ trackPosition: true });
      });

      // 2.10
      it('on node elements with both rdf:about and rdf:nodeID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" rdf:nodeID="abc" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Line 5 column 91: Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while abc and http://www.w3.org/TR/rdf-syntax-grammar where found.'));
      });

      // 2.10
      it('on node elements with both rdf:nodeID and rdf:about', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:nodeID="abc" rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Line 5 column 91: Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while http://www.w3.org/TR/rdf-syntax-grammar and abc where found.'));
      });
    });

    describe('should error', () => {
      // 2.10
      it('on node elements with both rdf:about and rdf:nodeID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" rdf:nodeID="abc" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while abc and http://www.w3.org/TR/rdf-syntax-grammar where found.'));
      });

      // 2.10
      it('on node elements with both rdf:nodeID and rdf:about', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:nodeID="abc" rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while http://www.w3.org/TR/rdf-syntax-grammar and abc where found.'));
      });

      // 2.10
      it('on node elements with both rdf:ID and rdf:nodeID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:ID="xyz" rdf:nodeID="abc" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while abc and #xyz where found.'));
      });

      // 2.10
      it('on node elements with both rdf:nodeID and rdf:ID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:nodeID="abc" rdf:ID="xyz" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while xyz and abc where found.'));
      });

      // 2.10
      it('on node elements with both rdf:about and rdf:ID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://base.org">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" rdf:ID="abc" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while abc and http://www.w3.org/TR/rdf-syntax-grammar where found.'));
      });

      // 2.10
      it('on node elements with both rdf:ID and rdf:about', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:ID="abc" rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Only one of rdf:about, rdf:nodeID and rdf:ID can be present, ' +
            'while http://www.w3.org/TR/rdf-syntax-grammar and #abc where found.'));
      });

      // 2.10
      it('when multiple equal rdf:ID occurrences on node elements are found', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://base.org">
  <rdf:Description rdf:ID="abc" />
  <rdf:Description rdf:ID="def" />
  <rdf:Description rdf:ID="abc" />
</rdf:RDF>`)).rejects.toEqual(
          new Error('Found multiple occurrences of rdf:ID=\'http://base.org#abc\'.'));
      });

      // 2.17
      it('when multiple equal rdf:ID occurrences on property elements are found', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://base.org">
  <rdf:Description>
    <ex:prop rdf:ID="abc">1</ex:prop>
    <ex:prop rdf:ID="abc">2</ex:prop>
  <rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('Found multiple occurrences of rdf:ID=\'http://base.org#abc\'.'));
      });

      // 2.10, 2.17
      it('when multiple equal rdf:ID occurrences on node and property elements are found', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://base.org">
  <rdf:Description rdf:ID="abc">
    <ex:prop rdf:ID="abc">1</ex:prop>
  <rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('Found multiple occurrences of rdf:ID=\'http://base.org#abc\'.'));
      });

      it('when rdf:ID is used without base', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:ID="abc">
    <ex:prop>1</ex:prop>
  <rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('Invalid IRI according to RDF Turtle: \'#abc\''));
      });

      // 2.10
      it('on property elements with both rdf:nodeID and rdf:about', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:nodeID="abc" rdf:resource="http://www.w3.org/TR/rdf-syntax-grammar" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('Found both rdf:resource (http://www.w3.org/TR/rdf-syntax-grammar) and rdf:nodeID (abc).'));
      });

      // 2.10
      it('on property elements with both rdf:nodeID and rdf:about', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:resource="http://www.w3.org/TR/rdf-syntax-grammar" rdf:nodeID="abc" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Found both rdf:resource and rdf:nodeID (abc).'));
      });

      // 2.11
      it('on property elements with both rdf:parseType="Resource" and rdf:resource', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:parseType="Resource" rdf:resource="http://www.w3.org/TR/rdf-syntax-grammar" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('rdf:parseType is not allowed on property elements with rdf:resource ' +
            '(http://www.w3.org/TR/rdf-syntax-grammar)'));
      });

      // 2.11
      it('on property elements with both rdf:parseType="Resource" and rdf:datatype', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:parseType="Resource" rdf:datatype="http://www.w3.org/TR/rdf-syntax-grammar" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('rdf:parseType is not allowed on property elements with rdf:datatype ' +
            '(http://www.w3.org/TR/rdf-syntax-grammar)'));
      });

      // 2.12
      it('on property elements with both non-rdf:* properties and rdf:datatype', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor dc:title="xyz" rdf:datatype="http://www.w3.org/TR/rdf-syntax-grammar" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Found both non-rdf:* property attributes and rdf:datatype ' +
          '(http://www.w3.org/TR/rdf-syntax-grammar).'));
      });

      // 2.11
      it('on property elements with both rdf:parseType="Resource" and rdf:nodeID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:parseType="Resource" rdf:nodeID="abc" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('rdf:parseType is not allowed on property elements ' +
          'with rdf:nodeID (abc)'));
      });

      // 2.12
      it('on property elements with both non-rdf:* properties and rdf:nodeID', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor dc:title="xyz" rdf:nodeID="abc" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Found both non-rdf:* property attributes and rdf:nodeID (abc).'));
      });

      // 2.11
      it('on property elements with both rdf:resource and rdf:parseType="Resource"', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:resource="http://www.w3.org/TR/rdf-syntax-grammar" rdf:parseType="Resource" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('rdf:parseType is not allowed on property elements with rdf:nodeID ' +
            'or rdf:resource (http://www.w3.org/TR/rdf-syntax-grammar)'));
      });

      // 2.12
      it('on property elements with both rdf:datatype and rdf:parseType="Resource"', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:datatype="http://www.w3.org/TR/rdf-syntax-grammar" rdf:parseType="Resource" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('rdf:parseType is not allowed on property elements with rdf:datatype ' +
            '(http://www.w3.org/TR/rdf-syntax-grammar)'));
      });

      // 2.11
      it('on property elements with both rdf:nodeID and rdf:parseType="Resource"', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:nodeID="abc" rdf:parseType="Resource" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('rdf:parseType is not allowed on property elements with ' +
          'rdf:nodeID or rdf:resource (abc)'));
      });

      // 2.11, 2.12
      it('on property elements with attributes and rdf:parseType="Resource"', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor dc:title="abc" rdf:parseType="Resource" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('rdf:parseType is not allowed when non-rdf:* property attributes ' +
          'are present'));
      });

      // 2.11
      it('on property elements with rdf:parseType="Resource" and attributes', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:parseType="Resource" dc:title="abc" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Found illegal rdf:* properties on property element with attribute: abc'));
      });

      // 2.12
      it('on property elements with rdf:datatype and attributes', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://base.org/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:datatype="xyy" dc:title="abc" />
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Found illegal rdf:* properties on property element with attribute: abc'));
      });

      // Forbidden property element name
      it('on Description as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:Description rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: Description'));
      });

      // Forbidden property element name
      it('on ID as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:ID rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: ID'));
      });

      // Forbidden property element name
      it('on RDF as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:RDF rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: RDF'));
      });

      // Forbidden property element name
      it('on about as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:about rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: about'));
      });

      // Forbidden property element name
      it('on bagID as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:bagID rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: bagID'));
      });

      // Forbidden property element name
      it('on parseType as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:parseType rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: parseType'));
      });

      // Forbidden property element name
      it('on resource as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:resource rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: resource'));
      });

      // Forbidden property element name
      it('on nodeID as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:nodeID rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: nodeID'));
      });

      // Forbidden property element name
      it('on aboutEach as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:aboutEach rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: aboutEach'));
      });

      // Forbidden property element name
      it('on aboutEachPrefix as property element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/node1">
    <rdf:aboutEachPrefix rdf:resource="http://example.org/node2"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal property element name: aboutEachPrefix'));
      });

      // Forbidden node element name
      it('on RDF as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:RDF/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: RDF'));
      });

      // Forbidden node element name
      it('on ID as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:ID/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: ID'));
      });

      // Forbidden node element name
      it('on about as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:about/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: about'));
      });

      // Forbidden node element name
      it('on bagID as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:bagID/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: bagID'));
      });

      // Forbidden node element name
      it('on parseType as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:parseType/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: parseType'));
      });

      // Forbidden node element name
      it('on resource as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:resource/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: resource'));
      });

      // Forbidden node element name
      it('on nodeID as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:nodeID/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: nodeID'));
      });

      // Forbidden node element name
      it('on li as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:li/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: li'));
      });

      // Forbidden node element name
      it('on aboutEach as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:aboutEach/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: aboutEach'));
      });

      // Forbidden node element name
      it('on aboutEachPrefix as node element name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:aboutEachPrefix/>
</rdf:RDF>`)).rejects.toEqual(new Error('Illegal node element name: aboutEachPrefix'));
      });

      // Illegal XML name production
      it('on rdf:nodeID with illegal XML Name on a property element', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

 <rdf:Description>
   <eg:prop rdf:nodeID="q:name" />
 </rdf:Description>

</rdf:RDF>`)).rejects.toEqual(new Error('Not a valid NCName: q:name'));
      });

      // Illegal XML name production
      it('on rdf:nodeID with illegal XML Name on a node element', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

 <rdf:Description rdf:nodeID="_:bnode" />

</rdf:RDF>`)).rejects.toEqual(new Error('Not a valid NCName: _:bnode'));
      });

      // Illegal XML name production
      it('on rdf:nodeID with illegal blank node on a resource node element', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:ns1="x:" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

  <rdf:Description rdf:about="http://example.org/">
    <ns1:b rdf:resource="_:bnode"/>
  </rdf:Description>

</rdf:RDF>`)).rejects.toEqual(new Error('Invalid IRI according to RDF Turtle: \'_:bnode\''));
      });

      // Illegal XML name production
      it('on rdf:ID with illegal XML Name', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

 <!-- &#x301; is a non-spacing acute accent.
      It is legal within an XML Name, but not as the first
      character.     -->

 <rdf:Description rdf:ID="&#x301;bb" eg:prop="val" />

</rdf:RDF>`)).rejects.toEqual(new Error('Not a valid NCName: ́bb'));
      });

      // Deprecated rdf:bagID
      it('on rdf:bagID on a property element', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

 <rdf:Description>
   <eg:prop rdf:bagID="q:name" />
 </rdf:Description>

</rdf:RDF>`)).rejects.toEqual(new Error('rdf:bagID is not supported.'));
      });

      // Deprecated rdf:bagID
      it('on rdf:bagID on a node element', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

 <rdf:Description rdf:bagID='333-555-666' />

</rdf:RDF>`)).rejects.toEqual(new Error('rdf:bagID is not supported.'));
      });

      // Deprecated rdf:aboutEach
      it('on rdf:aboutEach', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://base.org/">

  <rdf:Bag rdf:ID="node">
    <rdf:li rdf:resource="http://example.org/node2"/>
  </rdf:Bag>

  <rdf:Description rdf:aboutEach="#node">
    <dc:rights xmlns:dc="http://purl.org/dc/elements/1.1/">me</dc:rights>
  </rdf:Description>

</rdf:RDF>`)).rejects.toEqual(new Error('rdf:aboutEach is not supported.'));
      });

      // Deprecated rdf:aboutEachPrefix
      it('on rdf:aboutEachPrefix', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

  <rdf:Description rdf:about="http://example.org/node">
    <eg:property>foo</eg:property>
  </rdf:Description>

  <rdf:Description rdf:aboutEachPrefix="http://example.org/">
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">me</dc:creator>
  </rdf:Description>

</rdf:RDF>`)).rejects.toEqual(new Error('rdf:aboutEachPrefix is not supported.'));
      });

      // Forbidden rdf:li on node elements
      it('on li node elements', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:foo="http://foo/">

  <foo:bar rdf:li="1"/>
</rdf:RDF>`)).rejects.toEqual(new Error('rdf:li on node elements are not supported.'));
      });

      it('on unknown prefixes in property tags', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:dc="http://purl.org/dc/elements/1.1/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop>1</ex:prop>
  <rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
          new Error('5:13: unbound namespace prefix: "ex".'));
      });

      it('on illegal its:dir values', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us" its:dir="abc">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
            new Error('Base directions must either be \'ltr\' or \'rtl\', while \'abc\' was found.'));
      });

      it('on rdf:parseType="Triple" with missing predicate in triple term', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/triples/"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
            new Error('Expected exactly one triple term in rdf:parseType="Triple" but got 0'));
      });

      it('on rdf:parseType="Triple" with multiple triple terms', async () => {
        return expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/triples/"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
        <ex:p rdf:resource="http://example.org/stuff/1.0/o1" />
        <ex:p rdf:resource="http://example.org/stuff/1.0/o2" />
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`)).rejects.toEqual(
            new Error('Expected exactly one triple term in rdf:parseType="Triple" but got 2'));
      });
    });

    describe('should parse', () => {
      // 2.6
      it('an empty document', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" />`))
          .toBeRdfIsomorphic([]);
      });

      // 2.6
      it('and ignore unknown xml:* attributes', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:bla="bla">
  <rdf:Description>
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([]);
      });

      // 2.6
      it('an empty rdf:Description', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description>
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([]);
      });

      // 2.6
      it('a self-closing empty rdf:Description', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description />
</rdf:RDF>`))
          .toBeRdfIsomorphic([]);
      });

      // 2.6
      it('an rdf:Description without attributes', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([]);
      });

      // 2.6
      it('a self-closing rdf:Description without attributes', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" />
</rdf:RDF>`))
          .toBeRdfIsomorphic([]);
      });

      // 2.5
      it('an rdf:Description with an attribute', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title="RDF1.1 XML Syntax">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://purl.org/dc/elements/1.1/title', '"RDF1.1 XML Syntax"'),
          ]);
      });

      it('declaration of the default namespace on the property element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.com">
       <title xmlns="http://purl.org/dc/terms/" xml:lang="en">RDF1.1 XML Syntax</title>
  </rdf:Description>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://purl.org/dc/terms/title', '"RDF1.1 XML Syntax"@en'),
            ]);
      });

      it('declaration of the namespace on the property element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.com">
       <dct:title xmlns:dct="http://purl.org/dc/terms/" xml:lang="en">RDF1.1 XML Syntax</dct:title>
  </rdf:Description>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://purl.org/dc/terms/title', '"RDF1.1 XML Syntax"@en'),
            ]);
      });

      it('declaration of the namespace on the resource element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.com" xmlns:dct="http://purl.org/dc/terms/">
       <dct:title xml:lang="en">RDF1.1 XML Syntax</dct:title>
  </rdf:Description>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://purl.org/dc/terms/title', '"RDF1.1 XML Syntax"@en'),
            ]);
      });

      it('declaration of the default namespace on the resource element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.com" xmlns="http://purl.org/dc/terms/">
       <title xml:lang="en">RDF1.1 XML Syntax</title>
  </rdf:Description>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://purl.org/dc/terms/title', '"RDF1.1 XML Syntax"@en'),
            ]);
      });


      it('declaration of the namespace on a typed resource element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <dct:Standard rdf:about="http://example.com" xmlns:dct="http://purl.org/dc/terms/">
  </dct:Standard>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://purl.org/dc/terms/Standard'),
            ]);
      });

      it('cdata support', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dct="http://purl.org/dc/terms/" >
  <rdf:Description rdf:about="http://example.com">
       <dct:title><![CDATA[A title with a <tag>]]></dct:title>
  </rdf:Description>
</rdf:RDF>`))
            .toBeRdfIsomorphic([
              quad('http://example.com',
                  'http://purl.org/dc/terms/title', '"A title with a <tag>"'),
            ]);
      });

      it('DOCTYPE and ENTITY\'s', async () => {
        return expect(await parse(parser, `<!DOCTYPE rdf:RDF
[<!ENTITY rdf "http://www.w3.org/1999/02/22-rdf-syntax-ns#">
 <!ENTITY dc "http://purl.org/dc/elements/1.1/">
 ]>
<rdf:RDF xmlns:rdf="&rdf;"
            xmlns:dc="&dc;">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title="RDF1.1 XML Syntax">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://purl.org/dc/elements/1.1/title', '"RDF1.1 XML Syntax"'),
          ]);
      });

      it('DOCTYPE and ENTITY\'s with single quotes', async () => {
        return expect(await parse(parser, `<!DOCTYPE rdf:RDF
[<!ENTITY rdf 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'>
 <!ENTITY dc 'http://purl.org/dc/elements/1.1/'>
 ]>
<rdf:RDF xmlns:rdf="&rdf;"
            xmlns:dc="&dc;">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title="RDF1.1 XML Syntax">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://purl.org/dc/elements/1.1/title', '"RDF1.1 XML Syntax"'),
          ]);
      });

      it('DOCTYPE and ENTITY\'s in xml:base with multiple whitespaces', async () => {
        return expect(await parse(parser, `<!DOCTYPE rdf:RDF [
    <!ENTITY ssnx "http://purl.oclc.org/NET/ssnx/" >
    <!ENTITY \t\n   xsd  \n   \t   "http://www.w3.org/2001/XMLSchema#"  \t\n  >
]>

<rdf:RDF xmlns="&ssnx;ssn#"
     xml:base="&ssnx;ssn"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <owl:Ontology rdf:about="">
        <rdfs:comment rdf:datatype="&xsd;string">ABC</rdfs:comment>
    </owl:Ontology>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2002/07/owl#Ontology'),
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/2000/01/rdf-schema#comment', '"ABC"'),
          ]);
      });

      it('DOCTYPE and ENTITY\'s in xml:base', async () => {
        return expect(await parse(parser, `<!DOCTYPE rdf:RDF [
    <!ENTITY ssnx "http://purl.oclc.org/NET/ssnx/" >
    <!ENTITY xsd "http://www.w3.org/2001/XMLSchema#" >
]>

<rdf:RDF xmlns="&ssnx;ssn#"
     xml:base="&ssnx;ssn"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <owl:Ontology rdf:about="">
        <rdfs:comment rdf:datatype="&xsd;string">ABC</rdfs:comment>
    </owl:Ontology>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2002/07/owl#Ontology'),
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/2000/01/rdf-schema#comment', '"ABC"'),
          ]);
      });

      it('DOCTYPE and ENTITY\'s in xmlns prefixes', async () => {
        return expect(await parse(parser, `<!DOCTYPE rdf:RDF [
    <!ENTITY ssnx "http://purl.oclc.org/NET/ssnx/" >
    <!ENTITY xsd "http://www.w3.org/2001/XMLSchema#" >
    <!ENTITY w3 "http://www.w3.org/1999/02/" >
]>

<rdf:RDF xmlns="&ssnx;ssn#"
     xml:base="http://purl.oclc.org/NET/ssnx/ssn"
     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
     xmlns:owl="http://www.w3.org/2002/07/owl#"
     xmlns:rdf="&w3;22-rdf-syntax-ns#">
    <owl:Ontology rdf:about="">
        <rdfs:comment rdf:datatype="&xsd;string">ABC</rdfs:comment>
    </owl:Ontology>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/2002/07/owl#Ontology'),
            quad('http://purl.oclc.org/NET/ssnx/ssn',
              'http://www.w3.org/2000/01/rdf-schema#comment', '"ABC"'),
          ]);
      });

      // 2.5
      it('an rdf:Description without rdf:about and with an attribute', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description dc:title="RDF1.1 XML Syntax">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF1.1 XML Syntax"'),
          ]);
      });

      // 2.5
      it('an rdf:Description without rdf:about and with an attribute with a custom default', async () => {
        const myParser = new RdfXmlParser({ defaultGraph: DF.namedNode('http://example.org/g1') });
        return expect(await parse(myParser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description dc:title="RDF1.1 XML Syntax">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF1.1 XML Syntax"', 'http://example.org/g1'),
          ]);
      });

      // 2.5
      it('an rdf:Description with multiple attributes', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title1="RDF1.1 XML Syntax"
             dc:title2="RDF1.1 XML Syntax bis">
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://purl.org/dc/elements/1.1/title1', '"RDF1.1 XML Syntax"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://purl.org/dc/elements/1.1/title2', '"RDF1.1 XML Syntax bis"'),
          ]);
      });

      // 2.5
      it('an rdf:Description without rdf:about with multiple attributes and have the same blank node', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description dc:title1="RDF1.1 XML Syntax" dc:title2="RDF1.1 XML Syntax bis">
  </rdf:Description>
</rdf:RDF>`);
        return expect(array).toBeRdfIsomorphic([
          quad('_:b', 'http://purl.org/dc/elements/1.1/title1', '"RDF1.1 XML Syntax"'),
          quad('_:b', 'http://purl.org/dc/elements/1.1/title2', '"RDF1.1 XML Syntax bis"'),
        ]);
      });

      it('an rdf:Description with an empty property element should define an empty literal', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor />
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://example.org/stuff/1.0/editor', '""'),
          ]);
      });

      // 2.2
      it('an rdf:Description with a valid property element', async () => {
        return expect(await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description rdf:about="http://purl.org/net/dajobe/" />
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`))
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar',
              'http://example.org/stuff/1.0/editor', 'http://purl.org/net/dajobe/'),
          ]);
      });

      // 2.2
      it('nested property tags', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description>
    <ex:editor>
      <rdf:Description>
        <ex:homePage>
          <rdf:Description>
          </rdf:Description>
        </ex:homePage>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_:b1', 'http://example.org/stuff/1.0/editor', '_:b2'),
            quad('_:b2', 'http://example.org/stuff/1.0/homePage', '_:b3'),
          ]);
      });

      // 2.2
      it('nested property tags with IRIs', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description>
        <ex:homePage>
          <rdf:Description rdf:about="http://purl.org/net/dajobe/">
          </rdf:Description>
        </ex:homePage>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b1'),
            quad('_:b1', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
          ]);
      });

      // 2.3
      it('property values with strings', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.3
      it('property values with empty strings', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title></dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title', '""'),
          ]);
      });
      // 2.2
      it('multiple rdf:Descriptions', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description>
        <ex:homePage>
          <rdf:Description rdf:about="http://purl.org/net/dajobe/">
          </rdf:Description>
        </ex:homePage>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>

  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description>
        <ex:fullName>Dave Beckett</ex:fullName>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>

  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b1'),
            quad('_:b1', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b2'),
            quad('_:b2', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.3
      it('multiple abbreviated rdf:Descriptions', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description>
        <ex:homePage>
          <rdf:Description rdf:about="http://purl.org/net/dajobe/">
          </rdf:Description>
        </ex:homePage>
        <ex:fullName>Dave Beckett</ex:fullName>
      </rdf:Description>
    </ex:editor>
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b1'),
            quad('_:b1', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
            quad('_:b1', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.4
      it('empty property elements with rdf:resource', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:homePage rdf:resource="http://purl.org/net/dajobe/" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/homePage',
              'http://purl.org/net/dajobe/'),
          ]);
      });

      // 2.4
      it('empty property elements with rdf:resource mixed with other tags', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor>
      <rdf:Description>
        <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>
        <ex:fullName>Dave Beckett</ex:fullName>
      </rdf:Description>
    </ex:editor>
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b1'),
            quad('_:b1', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
            quad('_:b1', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.7
      it('xml:lang on node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"@en-us'),
          ]);
      });

      // 2.8
      it('its:dir on node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us" its:dir="ltr">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
                  '"RDF 1.1 XML Syntax"@en-us--ltr'),
            ]);
      });

      // 2.7
      it('xml:lang on nested node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us">
    <ex:editor>
      <rdf:Description>
        <dc:title>RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"@en-us'),
          ]);
      });

      // 2.8
      it('its:dir on nested node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us" its:dir="ltr">
    <ex:editor>
      <rdf:Description>
        <dc:title>RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
              quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"@en-us--ltr'),
            ]);
      });

      // 2.7
      it('xml:lang resets on node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us">
    <ex:editor>
      <rdf:Description xml:lang="">
        <dc:title>RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.8
      it('its:dir resets on node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us" its:dir="ltr">
    <ex:editor>
      <rdf:Description xml:lang="" its:dir="">
        <dc:title>RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
              quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"'),
            ]);
      });

      // 2.7
      it('xml:lang on property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title xml:lang="en-us">RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"@en-us'),
          ]);
      });

      // 2.8
      it('its:dir on property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title xml:lang="en-us" its:dir="rtl" its:version="2.0">RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
                  '"RDF 1.1 XML Syntax"@en-us--rtl'),
            ]);
      });

      // 2.7
      it('xml:lang resets on property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us">
    <ex:editor>
      <rdf:Description>
        <dc:title xml:lang="">RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"'),
          ]);
      });

      // 2.8
      it('its:dir resets on property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" xml:lang="en-us" its:dir="rtl">
    <ex:editor>
      <rdf:Description>
        <dc:title xml:lang="" its:dir="">RDF 1.1 XML Syntax</dc:title>
      </rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
              quad('_:b', 'http://purl.org/dc/elements/1.1/title', '"RDF 1.1 XML Syntax"'),
            ]);
      });

      // 2.7
      it('mixed xml:lang usage', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
    <dc:title xml:lang="en">RDF 1.1 XML Syntax</dc:title>
    <dc:title xml:lang="en-US">RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>

  <rdf:Description rdf:about="http://example.org/buecher/baum" xml:lang="de">
    <dc:title>Der Baum</dc:title>
    <dc:description>Das Buch ist außergewöhnlich</dc:description>
    <dc:title xml:lang="en">The Tree</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"@en'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF 1.1 XML Syntax"@en-us'),
            quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/title',
              '"Der Baum"@de'),
            quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/description',
              '"Das Buch ist au\u00DFergew\u00F6hnlich"@de'),
            quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/title',
              '"The Tree"@en'),
          ]);
      });

      // 2.8
      it('mixed its:dir usage', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            xmlns:its="http://www.w3.org/2005/11/its"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <dc:title>RDF 1.1 XML Syntax</dc:title>
    <dc:title xml:lang="en" its:dir="ltr">RDF 1.1 XML Syntax</dc:title>
    <dc:title xml:lang="en-US" its:dir="rtl">RDF 1.1 XML Syntax</dc:title>
  </rdf:Description>

  <rdf:Description rdf:about="http://example.org/buecher/baum" xml:lang="de" its:dir="ltr">
    <dc:title>Der Baum</dc:title>
    <dc:description>Das Buch ist außergewöhnlich</dc:description>
    <dc:title xml:lang="en" its:dir="rtl">The Tree</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
                  '"RDF 1.1 XML Syntax"'),
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
                  '"RDF 1.1 XML Syntax"@en--ltr'),
              quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
                  '"RDF 1.1 XML Syntax"@en-us--rtl'),
              quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/title',
                  '"Der Baum"@de--ltr'),
              quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/description',
                  '"Das Buch ist au\u00DFergew\u00F6hnlich"@de--ltr'),
              quad('http://example.org/buecher/baum', 'http://purl.org/dc/elements/1.1/title',
                  '"The Tree"@en--rtl'),
            ]);
      });

      // 2.8
      it('its:dir without rdf:version', async () => {
        const array = await parse(parser, `<?xml version="1.0" ?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:ex="http://example.org/"
  xmlns:its="http://www.w3.org/2005/11/its"
  its:version="2.0"
  its:dir="ltr"
  xml:lang="en">
  <rdf:Description rdf:about="http://example.org/joe" ex:name="bar" />
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/joe', 'http://example.org/name',
                  '"bar"@en'),
            ]);
      });

      // 2.9
      it('rdf:datatype on property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/item01">
    <ex:size rdf:datatype="http://www.w3.org/2001/XMLSchema#int">123</ex:size>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/item01', 'http://example.org/stuff/1.0/size',
              '"123"^^http://www.w3.org/2001/XMLSchema#int'),
          ]);
      });

      // 2.9
      it('rdf:datatype on property elements and ignore any higher-level xml:lang', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/item01" xml:lang="en-us">
    <ex:size rdf:datatype="http://www.w3.org/2001/XMLSchema#int">123</ex:size>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/item01', 'http://example.org/stuff/1.0/size',
              '"123"^^http://www.w3.org/2001/XMLSchema#int'),
          ]);
      });

      // 2.10
      it('rdf:nodeID on property elements as blank nodes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <ex:editor rdf:nodeID="abc"/>
  </rdf:Description>
</rdf:RDF>`);
        expect(array[0].object).toEqual(DF.blankNode('abc'));
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor',
              '_:b'),
          ]);
      });

      // 2.10
      it('rdf:nodeID on node elements as blank nodes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:nodeID="abc" ex:fullName="Dave Beckett" />
</rdf:RDF>`);
        expect(array[0].subject).toEqual(DF.blankNode('abc'));
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_b', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
          ]);
      });

      // 2.10
      it('rdf:nodeID on mixed node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
             dc:title="RDF/XML Syntax Specification (Revised)">
    <ex:editor rdf:nodeID="abc"/>
  </rdf:Description>

  <rdf:Description rdf:nodeID="abc" ex:fullName="Dave Beckett">
    <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>
  </rdf:Description>
</rdf:RDF>`);
        expect(array[1].object).toEqual(DF.blankNode('abc'));
        expect(array[2].subject).toEqual(DF.blankNode('abc'));
        expect(array[3].subject).toEqual(DF.blankNode('abc'));
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF/XML Syntax Specification (Revised)"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
            quad('_:b', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
          ]);
      });

      // 2.11
      it('nested property elements with rdf:parseType="resource"', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
                   dc:title="RDF/XML Syntax Specification (Revised)">
    <ex:editor rdf:parseType="Resource">
      <ex:fullName>Dave Beckett</ex:fullName>
      <ex:homePage rdf:resource="http://purl.org/net/dajobe/"/>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF/XML Syntax Specification (Revised)"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
            quad('_:b', 'http://example.org/stuff/1.0/homePage', 'http://purl.org/net/dajobe/'),
          ]);
      });

      // 2.11
      it('and ignore rdf:parseType="resource"', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
                   dc:title="RDF/XML Syntax Specification (Revised)">
    <ex:editor rdf:parseType="resource" rdf:nodeID="abc" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF/XML Syntax Specification (Revised)"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
          ]);
      });

      // 2.12
      it('property attributes on empty property elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar"
            dc:title="RDF/XML Syntax Specification (Revised)">
    <ex:editor ex:fullName="Dave Beckett" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://purl.org/dc/elements/1.1/title',
              '"RDF/XML Syntax Specification (Revised)"'),
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://example.org/stuff/1.0/editor', '_:b'),
            quad('_:b', 'http://example.org/stuff/1.0/fullName', '"Dave Beckett"'),
          ]);
      });

      // 2.13
      it('non-compacted typed node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/thing">
    <rdf:type rdf:resource="http://example.org/stuff/1.0/Document"/>
    <dc:title>A marvelous thing</dc:title>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/thing', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/stuff/1.0/Document'),
            quad('http://example.org/thing', 'http://purl.org/dc/elements/1.1/title',
              '"A marvelous thing"'),
          ]);
      });

      // 2.13
      it('typed node elements', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <ex:Document rdf:about="http://example.org/thing">
    <dc:title>A marvelous thing</dc:title>
  </ex:Document>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/thing', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/stuff/1.0/Document'),
            quad('http://example.org/thing', 'http://purl.org/dc/elements/1.1/title',
              '"A marvelous thing"'),
          ]);
      });

      // 2.14
      it('shortened URIs in rdf:about, rdf:resource and rdf:datatype with xml:base on the root tag', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/here/">
  <rdf:Description rdf:about="snack">
    <ex:prop rdf:resource="fruit/apple"/>
    <ex:prop2 rdf:resource="http://example.org/"/>
    <ex:editor rdf:datatype="abc">def</ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/prop',
              'http://example.org/here/fruit/apple'),
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/prop2',
              'http://example.org/'),
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/editor',
              '"def"^^http://example.org/here/abc'),
          ]);
      });

      // 2.14
      it('shortened URIs in rdf:about, rdf:resource and rdf:datatype with xml:base in the parser options', async () => {
        const parserThis = new RdfXmlParser({ baseIRI: 'http://example.org/here/' });
        const array = await parse(parserThis, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="snack">
    <ex:prop rdf:resource="fruit/apple"/>
    <ex:prop2 rdf:resource="http://example.org/"/>
    <ex:editor rdf:datatype="abc">def</ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/prop',
              'http://example.org/here/fruit/apple'),
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/prop2',
              'http://example.org/'),
            quad('http://example.org/here/snack', 'http://example.org/stuff/1.0/editor',
              '"def"^^http://example.org/here/abc'),
          ]);
      });

      // 2.14
      it('shortened URIs in rdf:about, rdf:resource and rdf:datatype with xml:base on the root and inner tag',
        async () => {
          const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/here/">
  <rdf:Description rdf:about="snack" xml:base="http://example.org/here2/">
    <ex:prop rdf:resource="fruit/apple"/>
    <ex:prop2 rdf:resource="http://example.org/"/>
    <ex:editor rdf:datatype="abc">def</ex:editor>
  </rdf:Description>
</rdf:RDF>`);
          return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/here2/snack', 'http://example.org/stuff/1.0/prop',
                'http://example.org/here2/fruit/apple'),
              quad('http://example.org/here2/snack', 'http://example.org/stuff/1.0/prop2',
                'http://example.org/'),
              quad('http://example.org/here2/snack', 'http://example.org/stuff/1.0/editor',
                '"def"^^http://example.org/here2/abc'),
            ]);
        });

      // 2.14
      it('rdf:ID with xml:base on the root tag', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/here/">
  <rdf:Description rdf:ID="snack">
    <ex:prop rdf:resource="fruit/apple"/>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/here/#snack', 'http://example.org/stuff/1.0/prop',
              'http://example.org/here/fruit/apple'),
          ]);
      });

      // 2.14
      it('With an xml:base with fragment the fragment is ignored', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/dir/file#frag">
  <eg:type rdf:about="" />
  <rdf:Description rdf:ID="foo" >
    <eg:value rdf:resource="relpath" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/dir/file', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/type'),
            quad('http://example.org/dir/file#foo', 'http://example.org/value', 'http://example.org/dir/relpath'),
          ]);
      });

      // 2.14
      it('With an xml:base in an rdf:Description should apply it to the node itself', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/dir/file">
  <rdf:Description rdf:ID="frag" eg:value="v" xml:base="http://example.org/file2"/>
  <eg:type rdf:about="relFile" />
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/file2#frag', 'http://example.org/value', '"v"'),
            quad('http://example.org/dir/relFile', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/type'),
          ]);
      });

      it('With an xml:base relative to the document IRI', async () => {
        parser = new RdfXmlParser({ baseIRI: 'http://document.org/' });
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="/relative">
  <eg:type rdf:about="" />
  <rdf:Description rdf:ID="foo" >
    <eg:value rdf:resource="relpath" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://document.org/relative', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/type'),
            quad('http://document.org/relative#foo', 'http://example.org/value', 'http://document.org/relpath'),
          ]);
      });

      it('With an empty xml:base should resolve to the document IRI', async () => {
        parser = new RdfXmlParser({ baseIRI: 'http://document.org/' });
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="">
  <eg:type rdf:about="" />
  <rdf:Description rdf:ID="foo" >
    <eg:value rdf:resource="relpath" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://document.org/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/type'),
            quad('http://document.org/#foo', 'http://example.org/value', 'http://document.org/relpath'),
          ]);
      });

      // 2.15
      it('rdf:li properties', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Seq rdf:about="http://example.org/favourite-fruit">
    <rdf:li rdf:resource="http://example.org/banana"/>
    <rdf:li rdf:resource="http://example.org/apple"/>
    <rdf:li rdf:resource="http://example.org/pear"/>
  </rdf:Seq>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/favourite-fruit', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq'),
            quad('http://example.org/favourite-fruit', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#_1',
              'http://example.org/banana'),
            quad('http://example.org/favourite-fruit', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#_2',
              'http://example.org/apple'),
            quad('http://example.org/favourite-fruit', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#_3',
              'http://example.org/pear'),
          ]);
      });

      // 2.16
      it('properties in a rdf:parseType="Collection" to a linked list', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/basket">
    <ex:hasFruit rdf:parseType="Collection">
      <rdf:Description rdf:about="http://example.org/banana"/>
      <rdf:Description rdf:about="http://example.org/apple"/>
      <rdf:Description rdf:about="http://example.org/pear"/>
    </ex:hasFruit>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/basket', 'http://example.org/stuff/1.0/hasFruit', '_:b1'),
            quad('_:b1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/banana'),
            quad('_:b1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:b2'),
            quad('_:b2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/apple'),
            quad('_:b2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:b3'),
            quad('_:b3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/pear'),
            quad('_:b3', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      // 2.16
      it('zero properties in an empty tag in a rdf:parseType="Collection" to a linked list', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/basket">
    <ex:hasFruit rdf:parseType="Collection"></ex:hasFruit>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/basket', 'http://example.org/stuff/1.0/hasFruit',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      // 2.16
      it('zero properties in a self-closing tag in a rdf:parseType="Collection" to a linked list', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/basket">
    <ex:hasFruit rdf:parseType="Collection" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/basket', 'http://example.org/stuff/1.0/hasFruit',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
          ]);
      });

      it('rdf:parseType="Collection" and rdf:ID', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:eg="http://example.org/eg#"
    xml:base="http://example.com/">

    <rdf:Description rdf:about="http://example.org/eg#eric">
        <rdf:type rdf:parseType="Resource">
            <eg:intersectionOf rdf:ID="reif" rdf:parseType="Collection">
                <rdf:Description rdf:about="http://example.org/eg#Person"/>
                <rdf:Description rdf:about="http://example.org/eg#Male"/>
            </eg:intersectionOf>
        </rdf:type>
    </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/eg#eric', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '_:b99_a0'),
              quad('_:b99_a0', 'http://example.org/eg#intersectionOf', '_:b99_a1'),
              quad('http://example.com/#reif', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject', '_:b99_a0'),
              quad('http://example.com/#reif', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate', 'http://example.org/eg#intersectionOf'),
              quad('http://example.com/#reif', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object', '_:b99_a1'),
              quad('http://example.com/#reif', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
              quad('_:b99_a1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/eg#Person'),
              quad('_:b99_a1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:b99_a2'),
              quad('_:b99_a2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/eg#Male'),
              quad('_:b99_a2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
            ]);
      });

      // 2.17
      it('rdf:ID on a property with a literal to a reified statement', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:ID="triple1">blah</ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '"blah"'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject',
              'http://example.org/'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
              'http://example.org/stuff/1.0/prop'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object',
              '"blah"'),
          ]);
      });

      // 2.17
      it('rdf:ID on a property with a nested node to a reified statement', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:ID="triple1">
      <rdf:Description rdf:about="http://example.org/2" />
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/stuff/1.0/prop', 'http://example.org/2'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject',
              'http://example.org/'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
              'http://example.org/stuff/1.0/prop'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object',
              'http://example.org/2'),
          ]);
      });

      it('an anonymous property with properties with inner rdf:Description', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop1 ex:prop2="abc">
      <rdf:Description rdf:about="http://example.org/2" />
    </ex:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/stuff/1.0/prop1', 'http://example.org/2'),
            quad('http://example.org/2', 'http://example.org/stuff/1.0/prop2', '"abc"'),
          ]);
      });

      // 2.17
      it('rdf:ID on a property with parseType=\'Resource\' to a reified statement', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:ID="triple1" rdf:parseType='Resource'>
      <ex:prop2>abc</ex:prop2>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '_:b'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject',
              'http://example.org/'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
              'http://example.org/stuff/1.0/prop'),
            quad('http://example.org/triples/#triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object',
              '_:b'),
            quad('_:b', 'http://example.org/stuff/1.0/prop2', '"abc"'),
          ]);
      });

      // 2.17
      it('Identifical rdf:ID\'s are allowed if they refer to different resources', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description xml:base="http://example.org/dir/file"
                rdf:ID="frag" ex:value="v" />
  <rdf:Description rdf:ID="frag" ex:value="v" />
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/dir/file#frag', 'http://example.org/value', '"v"'),
            quad('http://example.org/triples#frag', 'http://example.org/value', '"v"'),
          ]);
      });

      // 2.8
      it('property element values with rdf:parseType="Literal" to literals', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/item01">
    <ex:prop rdf:parseType="Literal" xmlns:a="http://example.org/a#">
      <a:Box required="true">
        <a:widget size="10" />
        <a:grommit id="23">abc</a:grommit>
      </a:Box>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/item01', 'http://example.org/stuff/1.0/prop',
              '"\n      <a:Box xmlns:a="http://example.org/a#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.org/stuff/1.0/" required="true">\n' +
              '        <a:widget size="10"></a:widget>\n' +
              '        <a:grommit id="23">abc</a:grommit>\n' +
              '      </a:Box>\n' +
              '    "^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      // 2.8
      it('property element values with rdf:parseType="Literal" to literals without prefixes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://example.org/item01">
    <ex:prop rdf:parseType="Literal">
      <Box></Box>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/item01', 'http://example.org/stuff/1.0/prop',
              '"\n      <Box xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.org/stuff/1.0/"></Box>\n' +
              '    "^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
          ]);
      });

      it('and ignore unrecognized attributes on nodes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/schema#">
  <rdf:Description rdf:about="http://example.org/thing" xmlnewthing="anything">
    <ex:prop1>stuff</ex:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/thing', 'http://example.org/schema#prop1', '"stuff"'),
          ]);
      });

      it('and ignore unrecognized attributes on properties', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/schema#">
  <rdf:Description rdf:about="http://example.org/thing">
    <ex:prop1 xmlnewthing="anything">stuff</ex:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/thing', 'http://example.org/schema#prop1', '"stuff"'),
          ]);
      });

      it('and apply the language on node properties', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/schema#">
  <rdf:Description rdf:about="http://example.org/node"
                   xml:lang="fr"
                   eg:property="chat" />
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/node', 'http://example.org/schema#property', '"chat"@fr'),
          ]);
      });

      it('and allow rdf:ID to be used with other attributes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description>
    <eg:prop1 rdf:ID="reify" eg:prop2="val"></eg:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_:b0', 'http://example.org/prop1', '_:b1'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject', '_:b0'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
              'http://example.org/prop1'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object', '_:b1'),
            quad('_:b1', 'http://example.org/prop2', '"val"'),
          ]);
      });

      it('and allow rdf:ID to be used with other attributes (in reverse order)', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description>
    <eg:prop1 eg:prop2="val" rdf:ID="reify"></eg:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_:b0', 'http://example.org/prop1', '_:b1'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject', '_:b0'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
              'http://example.org/prop1'),
            quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object', '_:b1'),
            quad('_:b1', 'http://example.org/prop2', '"val"'),
          ]);
      });

      it('and allow rdf:resource to be used with other attributes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description>
    <eg:prop1 rdf:resource="http://example.org/object#uriRef" eg:prop2="val"></eg:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_:b', 'http://example.org/prop1', 'http://example.org/object#uriRef'),
            quad('http://example.org/object#uriRef', 'http://example.org/prop2', '"val"'),
          ]);
      });

      it('rdf:type on node elements should be seen as a named node instead of literal', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/resource/"
                   rdf:type="http://example.org/class/"/>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/resource/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/class/'),
          ]);
      });

      it('a missing rdf:RDF', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<Book xmlns="http://example.org/terms#">
  <title>Dogs in Hats</title>
</Book>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('_:b', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://example.org/terms#Book'),
            quad('_:b', 'http://example.org/terms#title',
              '"Dogs in Hats"'),
          ]);
      });

      it('not error on duplicate rdf:IDs when allowDuplicateRdfIds is enabled', async () => {
        parser = new RdfXmlParser({ allowDuplicateRdfIds: true });
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description rdf:ID="frag" ex:value="a" />
  <rdf:Description rdf:ID="frag" ex:value="b" />
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://example.org/triples#frag', 'http://example.org/value', '"a"'),
            quad('http://example.org/triples#frag', 'http://example.org/value', '"b"'),
          ]);
      });

      it('multiple identical property nodes as distinct blank nodes', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF
    xmlns:dct="http://purl.org/dc/terms/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
  <rdf:Description rdf:about="https://example.com/">
    <dct:creator>
      <rdf:Description>
        <rdfs:label>ABC</rdfs:label>
      </rdf:Description>
    </dct:creator>
    <dct:creator>
      <rdf:Description>
        <rdfs:label>XYZ</rdfs:label>
      </rdf:Description>
    </dct:creator>
  </rdf:Description>
</rdf:RDF>`);

        return expect(array)
          .toBeRdfIsomorphic([
            quad('https://example.com/', 'http://purl.org/dc/terms/creator', '_:b1'),
            quad('https://example.com/', 'http://purl.org/dc/terms/creator', '_:b2'),
            quad('_:b1', 'http://www.w3.org/2000/01/rdf-schema#label', '"ABC"'),
            quad('_:b2', 'http://www.w3.org/2000/01/rdf-schema#label', '"XYZ"'),
          ]);
      });

      // 2.12
      it('on property elements with an xmlns property and rdf:datatype', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description rdf:about="http://www.w3.org/TR/rdf-syntax-grammar">
    <bla:editor xmlns:bla="http://x.p.t/o/TBox#" rdf:datatype="http://www.w3.org/TR/rdf-syntax-grammar">Yes</bla:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://www.w3.org/TR/rdf-syntax-grammar', 'http://x.p.t/o/TBox#editor',
              '"Yes"^^http://www.w3.org/TR/rdf-syntax-grammar'),
          ]);
      });

      it('on property elements with an xmlns property and rdf:nodeID', async () => {
        const array = await parse(parser, `<?xml version="1.0" encoding="utf-8"?>
<rdf:RDF
  xmlns="http://ex.org/o/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">

  <rdf:Description rdf:about="http://ex.org/i/subject">
    <rdf:type rdf:resource="http://ex.org/o/type"/>
    <hasBlankNode rdf:nodeID="orange"/>
    <ns0:hasBlankNode xmlns:ns0="http://anon.org/o/" rdf:nodeID="yellow"/>
  </rdf:Description>

</rdf:RDF>`);
        return expect(array)
          .toBeRdfIsomorphic([
            quad('http://ex.org/i/subject', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
              'http://ex.org/o/type'),
            quad('http://ex.org/i/subject', 'http://ex.org/o/hasBlankNode', '_:orange'),
            quad('http://ex.org/i/subject', 'http://anon.org/o/hasBlankNode', '_:yellow"'),
          ]);
      });

      it('rdf:version attribute on the root tag', async () => {
        const cb = jest.fn();
        parser.on('version', cb);
        await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            rdf:version="1.2">
  <rdf:Description>
    <ex:editor>
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(cb).toHaveBeenCalledWith('1.2');
      });

      it('rdf:version attribute a property tag', async () => {
        const cb = jest.fn();
        parser.on('version', cb);
        await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description>
    <ex:editor rdf:version="1.2">
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(cb).toHaveBeenCalledWith('1.2');
      });

      it('rdf:version attribute an internal tag', async () => {
        const cb = jest.fn();
        parser.on('version', cb);
        await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description>
    <ex:editor>
      <rdf:Description rdf:version="1.2"></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`);
        return expect(cb).toHaveBeenCalledWith('1.2');
      });

      it('throws on an unsupported rdf:version', async () => {
        await expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            rdf:version="1.2-unknown">
  <rdf:Description>
    <ex:editor>
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`)).rejects.toThrow(`Detected unsupported version: 1.2-unknown`);
      });

      it('handles an unsupported rdf:version when parseUnsupportedVersions is true', async () => {
        parser = new RdfXmlParser({ parseUnsupportedVersions: true });
        await expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            rdf:version="1.2-unknown">
  <rdf:Description>
    <ex:editor>
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`)).resolves.toHaveLength(1);
      });

      it('throws on an unsupported version media type parameter', async () => {
        parser = new RdfXmlParser({ version: '1.2-unknown' });
        await expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/">
  <rdf:Description>
    <ex:editor>
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`)).rejects.toThrow(`Detected unsupported version as media type parameter: 1.2-unknown`);
      });

      it('handles an unsupported media type parameter when parseUnsupportedVersions is true', async () => {
        parser = new RdfXmlParser({ parseUnsupportedVersions: true, version: '1.2-unknown' });
        await expect(parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:ex="http://example.org/stuff/1.0/"
            rdf:version="1.2-unknown">
  <rdf:Description>
    <ex:editor>
      <rdf:Description></rdf:Description>
    </ex:editor>
  </rdf:Description>
</rdf:RDF>`)).resolves.toHaveLength(1);
      });

      // 2.19
      it('on property elements with rdf:parseType="Triple"', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/"
         rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
        <ex:p rdf:resource="http://example.org/stuff/1.0/o" />
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad(
                  'http://example.org/',
                  'http://example.org/stuff/1.0/prop',
                  '<<http://example.org/stuff/1.0/s http://example.org/stuff/1.0/p http://example.org/stuff/1.0/o>>'),
            ]);
      });

      // 2.19
      it('on property elements with rdf:parseType="Triple" without rdf:version', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
        <ex:p rdf:resource="http://example.org/stuff/1.0/o" />
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([]);
      });

      it('on property elements with rdf:parseType="Triple" with blank subject', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/"
         rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description>
        <ex:p rdf:resource="http://example.org/stuff/1.0/o" />
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad(
                  'http://example.org/',
                  'http://example.org/stuff/1.0/prop',
                  '<<_:b0 http://example.org/stuff/1.0/p http://example.org/stuff/1.0/o>>'),
            ]);
      });

      it('on property elements with rdf:parseType="Triple" with rdf:type', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/"
         rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:type="http://example.org/stuff/1.0/t" />
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad(
                  'http://example.org/',
                  'http://example.org/stuff/1.0/prop',
                  '<<_:b0 http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://example.org/stuff/1.0/t>>'),
            ]);
      });

      it('on property elements with rdf:parseType="Triple" and rdf:nodeID', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/"
         rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
        <ex:p rdf:nodeID="b1" />
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad(
                  'http://example.org/',
                  'http://example.org/stuff/1.0/prop',
                  '<<http://example.org/stuff/1.0/s http://example.org/stuff/1.0/p _:b0>>'),
            ]);
      });

      it('on property elements with nested rdf:parseType="Triple"', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/stuff/1.0/"
            xml:base="http://example.org/triples/"
            rdf:version="1.2">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:parseType="Triple">
      <rdf:Description rdf:about="http://example.org/stuff/1.0/s">
        <ex:p rdf:parseType="Triple">
          <rdf:Description rdf:about="http://example.org/stuff/1.0/s2">
            <ex:p2 rdf:resource="http://example.org/stuff/1.0/o2" />
          </rdf:Description>
        </ex:p>
      </rdf:Description>
    </ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad(
                  'http://example.org/',
                  'http://example.org/stuff/1.0/prop',
                  '<<http://example.org/stuff/1.0/s http://example.org/stuff/1.0/p <<http://example.org/stuff/1.0/s2 http://example.org/stuff/1.0/p2 http://example.org/stuff/1.0/o2>>>>'),
            ]);
      });

      it('on property elements with rdf:annotation', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:annotation="http://example.org/triple1">blah</ex:prop>
  </rdf:Description>
  <rdf:Description rdf:about="http://example.org/triple1">
    <ex:prop>foo</ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '"blah"'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://example.org/stuff/1.0/prop "blah">>'),
              quad('http://example.org/triple1', 'http://example.org/stuff/1.0/prop', '"foo"'),
            ]);
      });

      it('on property elements with rdf:annotationNodeID', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:annotationNodeID="triple1">blah</ex:prop>
  </rdf:Description>
  <rdf:Description rdf:nodeID="triple1">
    <ex:prop>foo</ex:prop>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '"blah"'),
              quad('_:b0', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://example.org/stuff/1.0/prop "blah">>'),
              quad('_:b0', 'http://example.org/stuff/1.0/prop', '"foo"'),
            ]);
      });

      it('on property elements with rdf:annotation with empty object literal', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:annotation="http://example.org/triple1" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '""'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://example.org/stuff/1.0/prop "">>'),
            ]);
      });

      it('on property elements with rdf:annotation with rdf:parseType="Resource"', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">
  <rdf:Description rdf:about="http://example.org/">
    <ex:prop rdf:annotation="http://example.org/triple1" rdf:parseType="Resource" />
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://example.org/stuff/1.0/prop', '_:b0'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://example.org/stuff/1.0/prop _:b0>>'),
            ]);
      });

      it('on property elements with rdf:annotation with inline property', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">
  <rdf:Description>
    <eg:prop1 rdf:annotation="http://example.org/triple1" eg:prop2="val"></eg:prop1>
  </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('_:b', 'http://example.org/prop2', '"val"'),
              quad('_:c', 'http://example.org/prop1', '_:b'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<_:c http://example.org/prop1 _:b>>'),
            ]);
      });

      it('on property elements with rdf:annotation with rdf:resource', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

 <rdf:Description rdf:about="http://example.org/">
   <rdf:type rdf:annotation="http://example.org/triple1"
             rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Resource"/>
 </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Resource'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://www.w3.org/1999/02/22-rdf-syntax-ns#Resource>>'),
            ]);
      });

      it('on property elements with rdf:annotation with rdf:nodeID', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/">

 <rdf:Description rdf:about="http://example.org/">
   <eg:prop rdf:annotation="http://example.org/triple1" rdf:nodeID="object"/>
 </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/', 'http://example.org/prop', '_:object'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/ http://example.org/prop _:object>>'),
            ]);
      });

      it('on property elements with nested rdf:annotation', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
 xmlns:eg="http://example.org/">

 <rdf:Description rdf:about="http://example.org/a">
   <eg:prop rdf:annotation="http://example.org/triple1">
     <rdf:Description rdf:about="http://example.org/b">
       <eg:prop rdf:annotation="http://example.org/triple2" rdf:resource="http://example.org/c"/>
     </rdf:Description>
   </eg:prop>
 </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/b', 'http://example.org/prop', 'http://example.org/c'),
              quad('http://example.org/triple2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/b http://example.org/prop http://example.org/c>>'),
              quad('http://example.org/a', 'http://example.org/prop', 'http://example.org/b'),
              quad('http://example.org/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://example.org/a http://example.org/prop http://example.org/b>>'),
            ]);
      });

      it('on property elements with rdf:annotation over a collection', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:eg="http://example.org/eg#"
    xml:base="http://example.com/">

    <rdf:Description rdf:about="http://example.org/eg#eric">
        <rdf:type rdf:parseType="Resource">
            <eg:intersectionOf rdf:annotation="http://example.com/triple1" rdf:parseType="Collection">
                <rdf:Description rdf:about="http://example.org/eg#Person"/>
                <rdf:Description rdf:about="http://example.org/eg#Male"/>
            </eg:intersectionOf>
        </rdf:type>
    </rdf:Description>
</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://example.org/eg#eric', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '_:an0'),
              quad('_:an0', 'http://example.org/eg#intersectionOf', '_:an1'),
              quad('http://example.com/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<_:an0 http://example.org/eg#intersectionOf _:an1>>'),
              quad('_:an1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/eg#Person'),
              quad('_:an1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', '_:an2'),
              quad('_:an2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first', 'http://example.org/eg#Male'),
              quad('_:an2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
            ]);
      });

      it('on property elements with rdf:annotation with literal parse type', async () => {
        const array = await parse(parser, `<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.com/">

  <rdf:Description rdf:about="http://www.example.org/a">
    <eg:prop rdf:annotation="http://example.com/triple1" rdf:parseType="Literal"><br /></eg:prop>
  </rdf:Description>

</rdf:RDF>`);
        return expect(array)
            .toBeRdfIsomorphic([
              quad('http://www.example.org/a', 'http://example.org/prop', '"<br xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:eg="http://example.org/"></br>"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'),
              quad('http://example.com/triple1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies', '<<http://www.example.org/a http://example.org/prop "<br xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:eg="http://example.org/"></br>"^^http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral>>'),
            ]);
      });
    });

    describe('streaming-wise', () => {
      const streamParser = new RdfXmlParser();

      it('should not emit on the empty string', () => {
        streamParser.write('');
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after the XML start tag', () => {
        streamParser.write('<?xml version="1.0"?>');
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after the RDF start tag', () => {
        streamParser.write(`<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.org/stuff/1.0/"
         xml:base="http://example.org/triples/">`);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after open an rdf:Description tag', () => {
        streamParser.write(`<rdf:Description `);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after a property attribute', () => {
        streamParser.write(`ex:title1="Title1" `);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after an rdf:about attribute', () => {
        streamParser.write(`rdf:about="http://www.w3.org/TR/rdf-syntax-grammar" `);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after another a property attribute', () => {
        streamParser.write(`ex:title2="Title2"`);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should emit 2 triples after closing the rdf:Description tag', () => {
        streamParser.write(`>`);
        expect(streamParser.read(1)).toEqualRdfQuad(quad('http://www.w3.org/TR/rdf-syntax-grammar',
          'http://example.org/stuff/1.0/title1', '"Title1"'));
        expect(streamParser.read(1)).toEqualRdfQuad(quad('http://www.w3.org/TR/rdf-syntax-grammar',
          'http://example.org/stuff/1.0/title2', '"Title2"'));
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after opening a property tag', () => {
        streamParser.write(`<ex:prop `);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after setting the resource in a property tag', () => {
        streamParser.write(` rdf:resource="http://example.org/" `);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should emit after closing the property tag', () => {
        streamParser.write(`/>`);
        expect(streamParser.read(1)).toEqualRdfQuad(quad('http://www.w3.org/TR/rdf-syntax-grammar',
          'http://example.org/stuff/1.0/prop', 'http://example.org/'));
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after closing the rdf:Description tag', () => {
        streamParser.write(`</rdf:Description>`);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should not emit after closing the rdf:RDF tag', () => {
        streamParser.write(`</rdf:RDF>`);
        expect(streamParser.read(1)).toBeFalsy();
      });

      it('should be closed after finishing the stream', () => {
        streamParser.end();
        expect(streamParser.read(1)).toBeFalsy();
        expect(streamParser.writable).toBeFalsy();
      });


      it('should properly support XML encoded URIs', async () => {
        expect(parse(parser, `<?xml version="1.0" encoding="utf-8" ?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ns0="b:">
  <rdf:Description rdf:about="a:&#xA;">
    <ns0:b rdf:resource="c:c"/>
  </rdf:Description>
</rdf:RDF>`)).rejects.toBeTruthy();
      });
    });
  });

  describe('an instance with disabled URI validation', () => {
    let parser: any;

    beforeEach(() => {
      parser = new RdfXmlParser({ validateUri: false });
    });

    describe('#valueToUri', () => {

      it('ignore a URI with an invalid scheme', () => {
        expect(() => parser.valueToUri('%https://example.com/', {}))
          .not.toThrow(new Error('Invalid URI: %https://example.com/'));
      });

      it('ignore a URI with an invalid character', () => {
        expect(() => parser.valueToUri('https://example.com/<', {}))
          .not.toThrow(new Error('Invalid URI: https://example.com/<'));
      });
    });
  });

  describe('#import', () => {
    let parser: any;

    beforeAll(() => {
      parser = new RdfXmlParser();
    });

    it('should parse a stream', async () => {
      const stream = streamifyString(`<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/resource/"
                   rdf:type="http://example.org/class/"/>
</rdf:RDF>`);
      return expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('http://example.org/resource/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          'http://example.org/class/'),
      ]);
    });

    it('should parse an object stream', async () => {
      const stream = streamifyArray([Buffer.from(`<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="http://example.org/resource/"
                   rdf:type="http://example.org/class/"/>
</rdf:RDF>`)]);
      return expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('http://example.org/resource/', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          'http://example.org/class/'),
      ]);
    });

    it('should parse another stream', async () => {
      const stream = streamifyString(`<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:eg="http://example.org/"
         xml:base="http://example.org/triples">
  <rdf:Description>
    <eg:prop1 eg:prop2="val" rdf:ID="reify"></eg:prop1>
  </rdf:Description>
</rdf:RDF>`);
      return expect(await arrayifyStream(parser.import(stream))).toBeRdfIsomorphic([
        quad('_:b0', 'http://example.org/prop1', '_:b1'),
        quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          'http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement'),
        quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#subject', '_:b0'),
        quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate',
          'http://example.org/prop1'),
        quad('http://example.org/triples#reify', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#object', '_:b1'),
        quad('_:b1', 'http://example.org/prop2', '"val"'),
      ]);
    });

    it('should forward error events', async () => {
      const stream = new PassThrough();
      stream._read = () => stream.emit('error', new Error('my error'));
      return expect(arrayifyStream(parser.import(stream))).rejects.toThrow(new Error('my error'));
    });
  });
});

function parse(parser: RdfXmlParser, input: string): Promise<RDF.Quad[]> {
  return arrayifyStream(streamifyString(input).pipe(parser));
}
