import {Util} from "../lib/Util";

describe('Util', () => {
  describe('#isCompactIri', () => {
    it('to be true for a simple compact IRI', async () => {
      expect(Util.isCompactIri('a:b')).toBeTruthy();
    });

    it('to be false for a term', async () => {
      expect(Util.isCompactIri('a')).toBeFalsy();
    });

    it('to be false for a hash that looks like a compact IRI', async () => {
      expect(Util.isCompactIri('#a:b')).toBeFalsy();
    });

    it('to be false for terms starting with a colon', async () => {
      expect(Util.isCompactIri(':b')).toBeFalsy();
    });
  });

  describe('#getPrefix', () => {
    it('to return a null when no colon exists', async () => {
      expect(Util.getPrefix('abc', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for just a colon', async () => {
      expect(Util.getPrefix(':', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for double slashed suffixes', async () => {
      expect(Util.getPrefix('http://abc', { '//': 'abc' })).toBe(null);
    });

    it('to return a null for blank nodes', async () => {
      expect(Util.getPrefix('_:abc', { _: 'abc' })).toBe(null);
    });

    it('to return a null for a non-existing term', async () => {
      expect(Util.getPrefix('abc:def', { def: 'abc' })).toBe(null);
    });

    it('to return a null for a non-existing term', async () => {
      expect(Util.getPrefix('abc:def', { abc: 'ABC' })).toBe('abc');
    });

    it('to return a null for terms starting with a hash', async () => {
      expect(Util.getPrefix('#abc:def', { abc: 'ABC' })).toBe(null);
    });
  });

  describe('#isPotentialKeyword', () => {
    it('should be true for potential keywords', async () => {
      expect(Util.isPotentialKeyword('@id')).toBeTruthy();
      expect(Util.isPotentialKeyword('@container')).toBeTruthy();
      expect(Util.isPotentialKeyword('@nest')).toBeTruthy();
      expect(Util.isPotentialKeyword('@ignore')).toBeTruthy();
      expect(Util.isPotentialKeyword('@ignoreMe')).toBeTruthy();
    });

    it('should be false for invalid keywords', async () => {
      expect(Util.isPotentialKeyword(null)).toBeFalsy();
      expect(Util.isPotentialKeyword(3)).toBeFalsy();
      expect(Util.isPotentialKeyword('@')).toBeFalsy();
      expect(Util.isPotentialKeyword('@!')).toBeFalsy();
      expect(Util.isPotentialKeyword('@3')).toBeFalsy();
    });
  });

  describe('#isPrefixValue', () => {
    it('should be false for null', async () => {
      expect(Util.isPrefixValue(null)).toBeFalsy();
    });

    it('should be true for strings', async () => {
      expect(Util.isPrefixValue('abc')).toBeTruthy();
    });

    it('should be true for empty objects', async () => {
      expect(Util.isPrefixValue({})).toBeTruthy();
    });

    it('should be true for objects with @id', async () => {
      expect(Util.isPrefixValue({ '@id': 'bla' })).toBeTruthy();
    });

    it('should be true for objects with @type', async () => {
      expect(Util.isPrefixValue({ '@type': 'bla' })).toBeTruthy();
    });
  });

  describe('#isValidIri', () => {
    it('should be false for null', async () => {
      expect(Util.isValidIri(null)).toBeFalsy();
    });

    it('should be false for an empty string', async () => {
      expect(Util.isValidIri('')).toBeFalsy();
    });

    it('should be false for an abc', async () => {
      expect(Util.isValidIri('abc')).toBeFalsy();
    });

    it('should be true for an abc:def', async () => {
      expect(Util.isValidIri('abc:def')).toBeTruthy();
    });

    it('should be true for an http://google.com', async () => {
      expect(Util.isValidIri('http://google.com')).toBeTruthy();
    });

    it('should be false for an http://google.com<', async () => {
      expect(Util.isValidIri('http://google.com<')).toBeFalsy();
    });

    it('should be false for an http://google .com', async () => {
      expect(Util.isValidIri('http://google .com')).toBeFalsy();
    });

    it('should be true for an http://google.com/#abc', async () => {
      expect(Util.isValidIri('http://google.com/#abc')).toBeTruthy();
    });

    it('should be false for an http://google.com/#ab#c', async () => {
      expect(Util.isValidIri('http://google.com/#ab#c')).toBeFalsy();
    });
  });

  describe('#isValidIriWeak', () => {
    it('should be false for null', async () => {
      expect(Util.isValidIriWeak(null)).toBeFalsy();
    });

    it('should be false for an empty string', async () => {
      expect(Util.isValidIriWeak('')).toBeFalsy();
    });

    it('should be false for an abc', async () => {
      expect(Util.isValidIriWeak('abc')).toBeFalsy();
    });

    it('should be true for an abc:def', async () => {
      expect(Util.isValidIriWeak('abc:def')).toBeTruthy();
    });

    it('should be true for an ./relative', async () => {
      expect(Util.isValidIriWeak('./relative')).toBeTruthy();
    });

    it('should be true for an http://google.com', async () => {
      expect(Util.isValidIriWeak('http://google.com')).toBeTruthy();
    });

    it('should be false for an :term', async () => {
      expect(Util.isValidIriWeak(':term')).toBeFalsy();
    });
  });

  describe('#isValidKeyword', () => {
    it('should be true for valid keywords', async () => {
      expect(Util.isValidKeyword('@id')).toBeTruthy();
      expect(Util.isValidKeyword('@container')).toBeTruthy();
      expect(Util.isValidKeyword('@nest')).toBeTruthy();
    });

    it('should be false for invalid keywords', async () => {
      expect(Util.isValidKeyword(null)).toBeFalsy();
      expect(Util.isValidKeyword(3)).toBeFalsy();
      expect(Util.isValidKeyword('@')).toBeFalsy();
      expect(Util.isValidKeyword('@!')).toBeFalsy();
      expect(Util.isValidKeyword('@3')).toBeFalsy();
      expect(Util.isValidKeyword('@ignore')).toBeFalsy();
      expect(Util.isValidKeyword('@ignoreMe')).toBeFalsy();
    });
  });

  describe('#isTermProtected', () => {
    it('to be false when a term is not present', async () => {
      expect(Util.isTermProtected({}, 'a')).toBeFalsy();
    });

    it('to be false on a string-based term', async () => {
      expect(Util.isTermProtected({ a: 'b' }, 'a')).toBeFalsy();
    });

    it('to be false on an object-based term', async () => {
      expect(Util.isTermProtected({ a: { '@id': 'b' } }, 'a')).toBeFalsy();
    });

    it('to be false on an object-based term with @protected: false', async () => {
      expect(Util.isTermProtected({ a: { '@id': 'b', '@protected': false } }, 'a')).toBeFalsy();
    });

    it('to be true on an object-based term with @protected: true', async () => {
      expect(Util.isTermProtected({ a: { '@id': 'b', '@protected': true } }, 'a')).toBeTruthy();
    });
  });

});
