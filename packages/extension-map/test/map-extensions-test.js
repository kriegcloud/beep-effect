/**
 * File: map-extensions-test.js
 * Unit tests for extensions/extension-map/lib/extensions.js
 */

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var ShExTerm = require("@shexjs/term");
var ShExUtil = require("@shexjs/util");
const emptySchema = {type: "Schema"};
const fakeValidator = {
  schema: emptySchema,
  semActHandler: {
    results: {},
    register: () => {}
  }
}
// or use a throw-away validator:
// const realValidator = require("@shexjs/validator").construct(emptySchema)
const Mapper = require("..")({Validator: {}});
const registered = Mapper.register(fakeValidator, {ShExTerm, ShExUtil})
var mapExtensions = Mapper.extensions;

describe('Map extensions', function() {

    it('should have a lift and lower API', function() {
        mapExtensions.should.be.an('object');
        mapExtensions.lift.should.exist;
        mapExtensions.lower.should.exist;
        mapExtensions.lift.should.be.a('function');
        mapExtensions.lower.should.be.a('function');
    });

    describe('#lift', function() {
        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lift
            ).to.throw(Error, /Invalid extension function: undefined!/);
        });

        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lift.bind(this, 'a test string')
            ).to.throw(Error, /Invalid extension function: a test string!/);
        });

        it('should throw an error if not given an extension function with no opening parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo)')
            ).to.throw(Error, /Invalid extension function: foo\)!/);
	});

        it('should throw an error if not given an extension function with no closing parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo(')
            ).to.throw(Error, /Invalid extension function: foo\(!/);
	});

        it('should throw an error if not given an extension function with closing parenthesis before opening parenthesis', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo)a(')
            ).to.throw(Error, /Invalid extension function: foo\)a\(!/);
	});

        it('should throw an error if not given an extension function argument', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo()')
            ).to.throw(Error, /Invalid extension function: foo\(\)!/);
        });

        it('should throw an error if given an unknown extension function', function() {
            expect(
                mapExtensions.lift.bind(this, 'foo(myvar)')
            ).to.throw(Error, /Unknown extension: foo\(myvar\)!/);
        });

        it('should execute the lift test function', function() {
            expect( 
                mapExtensions.lift('test(myvar)')
            ).to.equal('test(myvar)');
        });

        it('should execute a simple hashmap function', function() {
            expect(
                mapExtensions.lift(
                    'hashmap(test:string, {"alpha": "beta"})',
                    "alpha",
                    {"test": "urn:local:test:"}))
            .to.deep.equal(
                {'urn:local:test:string': 'beta'});
        });

        it('should execute a simple regex function', function() {
            expect(
                mapExtensions.lift(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    "Testing", 
                    {"dem": "http://a.example/dem#"})
            ).to.deep.equal(
                { 'http://a.example/dem#test': 'Testing' });
        });

    });

    describe('#lower', function() {
        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lower
            ).to.throw(Error, /Invalid extension function: undefined!/);
        });

        it('should throw an error if not given an extension function', function() {
            expect(
                mapExtensions.lower.bind(this, 'a test string')
            ).to.throw(Error, /Invalid extension function: a test string!/);
        });

        it('should throw an error if not given an extension function with no opening parenthesis', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo)')
            ).to.throw(Error, /Invalid extension function: foo\)!/);
	});

        it('should throw an error if not given an extension function with no closing parenthesis', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo(')
            ).to.throw(Error, /Invalid extension function: foo\(!/);
	});

        it('should throw an error if not given an extension function argument', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo()')
            ).to.throw(Error, /Invalid extension function: foo\(\)!/);
        });

        it('should throw an error if not given an unknown extension', function() {
            expect(
                mapExtensions.lower.bind(this, 'foo(myvar)')
            ).to.throw(Error, /Unknown extension: foo\(myvar\)!/);
        });

        it('should execute the lift test function', function() {
            expect(
                mapExtensions.lower('test(myvar)')
            ).to.equal('test(myvar)');
        });

        it('should execute a simple hashmap function', function() {
            expect(
                mapExtensions.lower(
                    'hashmap(test:string, {"alpha": "beta"})',
                    registered.binder([{"urn:local:test:string": "beta"}]),
                    {"test": "urn:local:test:"}))
            .to.equal('"alpha"');
        });

        it('should execute a simple regex function', function() {
            expect(
                mapExtensions.lower(
                    "regex(/(?<dem:test>^[a-zA-Z]+)/)", 
                    registered.binder([{ 'http://a.example/dem#test': 'Testing' }]), 
                    {"dem": "http://a.example/dem#"})
            ).to.equal('"Testing"');
        });
    });
    
});
