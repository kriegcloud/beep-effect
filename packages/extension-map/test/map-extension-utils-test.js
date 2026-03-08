/**
 * File: map-extension-utils-test.js
 * Unit tests for extensions/extension-map/lib/extension-utils.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var mapExtUtils = require("..")({Validator: {}}).utils;

describe('Map extension utils', function() {

    it('should have the expected API', function() {
        mapExtUtils.should.be.an('object');
        mapExtUtils.collapseSpaces.should.be.a('function');
        mapExtUtils.unescapeMetaChars.should.be.a('function');
    });

    describe('#collapseSpaces', function() {
        it('should replace white space with a single space', function() {
            expect(mapExtUtils.collapseSpaces('  A   Test   String   ')).to.equal(' A Test String ');
        });

        it('should not fail with empty string', function() {
            expect(mapExtUtils.collapseSpaces('')).to.equal('');
        });
    });

    describe('#unescapeMetaChars', function() {
 
        it('should unescape meta characters', function() {
            expect(mapExtUtils.unescapeMetaChars('<http:\/\/a.example\/dem#family>')).to.equal('<http://a.example/dem#family>');;
        });

        it('should not unescape regex characters', function() {
            expect(mapExtUtils.unescapeMetaChars('\\s*\\w.*')).to.equal('\\s*\\w.*');;
        });
    });
});
