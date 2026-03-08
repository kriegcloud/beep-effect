"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFacets = exports.testKnownTypes = exports.getNumericDatatype = void 0;
const XSD = "http://www.w3.org/2001/XMLSchema#";
const integerDatatypes = [
    XSD + "integer",
    XSD + "nonPositiveInteger",
    XSD + "negativeInteger",
    XSD + "long",
    XSD + "int",
    XSD + "short",
    XSD + "byte",
    XSD + "nonNegativeInteger",
    XSD + "unsignedLong",
    XSD + "unsignedInt",
    XSD + "unsignedShort",
    XSD + "unsignedByte",
    XSD + "positiveInteger"
];
const decimalDatatypes = [
    XSD + "decimal",
].concat(integerDatatypes);
const numericDatatypes = [
    XSD + "float",
    XSD + "double"
].concat(decimalDatatypes);
const numericParsers = {};
numericParsers[XSD + "integer"] = function (label, parseError) {
    if (!(label.match(/^[+-]?[0-9]+$/))) {
        parseError("illegal integer value '" + label + "'");
    }
    return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
    if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
        parseError("illegal decimal value '" + label + "'");
    }
    return parseFloat(label);
};
const DECIMAL_REGEX = /^[+\-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/;
numericParsers[XSD + "float"] = function (label, parseError) {
    if (label === "NaN")
        return NaN;
    if (label === "INF")
        return Infinity;
    if (label === "-INF")
        return -Infinity;
    if (!(label.match(DECIMAL_REGEX))) { // XSD has no pattern for float?
        parseError("illegal float value '" + label + "'");
    }
    return parseFloat(label);
};
numericParsers[XSD + "double"] = function (label, parseError) {
    if (label === "NaN")
        return NaN;
    if (label === "INF")
        return Infinity;
    if (label === "-INF")
        return -Infinity;
    if (!(label.match(DECIMAL_REGEX))) {
        parseError("illegal double value '" + label + "'");
    }
    return Number(label);
};
function testRange(value, datatype, parseError) {
    const ranges = {
        //    integer            -1 0 1 +1 | "" -1.0 +1.0 1e0 NaN INF
        //    decimal            -1 0 1 +1 -1.0 +1.0 | "" 1e0 NaN INF
        //    float              -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
        //    double             -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
        //    nonPositiveInteger -1 0 +0 -0 | 1 +1 1a a1
        //    negativeInteger    -1 | 0 +0 -0 1
        //    long               -1 0 1 +1 |
        //    int                -1 0 1 +1 |
        //    short              -32768 0 32767 | -32769 32768
        //    byte               -128 0 127 | "" -129 128
        //    nonNegativeInteger 0 -0 +0 1 +1 | -1
        //    unsignedLong       0 1 | -1
        //    unsignedInt        0 1 | -1
        //    unsignedShort      0 65535 | -1 65536
        //    unsignedByte       0 255 | -1 256
        //    positiveInteger    1 | -1 0
        //    string             "" "a" "0"
        //    boolean            true false 0 1 | "" TRUE FALSE tRuE fAlSe -1 2 10 01
        //    dateTime           "2012-01-02T12:34:56.78Z" | "" "2012-01-02T" "2012-01-02"
        integer: { min: -Infinity, max: Infinity },
        decimal: { min: -Infinity, max: Infinity },
        float: { min: -Infinity, max: Infinity },
        double: { min: -Infinity, max: Infinity },
        nonPositiveInteger: { min: -Infinity, max: 0 },
        negativeInteger: { min: -Infinity, max: -1 },
        long: { min: -9223372036854775808, max: 9223372036854775807 },
        int: { min: -2147483648, max: 2147483647 },
        short: { min: -32768, max: 32767 },
        byte: { min: -128, max: 127 },
        nonNegativeInteger: { min: 0, max: Infinity },
        unsignedLong: { min: 0, max: 18446744073709551615 },
        unsignedInt: { min: 0, max: 4294967295 },
        unsignedShort: { min: 0, max: 65535 },
        unsignedByte: { min: 0, max: 255 },
        positiveInteger: { min: 1, max: Infinity }
    };
    const parms = ranges[datatype.substr(XSD.length)];
    if (!parms)
        throw Error("unexpected datatype: " + datatype);
    if (value < parms.min) {
        parseError(`"${value}"^^<${datatype}> is less than the min: ${parms.min}`);
    }
    else if (value > parms.max) {
        parseError(`"${value}"^^<${datatype}> is greater than the min: ${parms.max}`);
    }
}
;
/*
function intSubType (spec, label, parseError) {
  const ret = numericParsers[XSD + "integer"](label, parseError);
  if ("min" in spec && ret < spec.min)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be < " + spec.min);
  if ("max" in spec && ret > spec.max)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be > " + spec.max);
  return ret;
}
[{type: "nonPositiveInteger", max: 0},
 {type: "negativeInteger", max: -1},
 {type: "long", min: -9223372036854775808, max: 9223372036854775807}, // beyond IEEE double
 {type: "int", min: -2147483648, max: 2147483647},
 {type: "short", min: -32768, max: 32767},
 {type: "byte", min: -128, max: 127},
 {type: "nonNegativeInteger", min: 0},
 {type: "unsignedLong", min: 0, max: 18446744073709551615},
 {type: "unsignedInt", min: 0, max: 4294967295},
 {type: "unsignedShort", min: 0, max: 65535},
 {type: "unsignedByte", min: 0, max: 255},
 {type: "positiveInteger", min: 1}].forEach(function (i) {
   numericParsers[XSD + i.type ] = function (label, parseError) {
     return intSubType(i, label, parseError);
   };
 });
*/
const stringTests = {
    length: function (v, l) { return v.length === l; },
    minlength: function (v, l) { return v.length >= l; },
    maxlength: function (v, l) { return v.length <= l; }
};
const numericValueTests = {
    mininclusive: function (n, m) { return n >= m; },
    minexclusive: function (n, m) { return n > m; },
    maxinclusive: function (n, m) { return n <= m; },
    maxexclusive: function (n, m) { return n < m; }
};
const decimalLexicalTests = {
    totaldigits: function (v, d) {
        const m = v.match(/[0-9]/g);
        return !!m && m.length <= d;
    },
    fractiondigits: function (v, d) {
        const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
        return !!m && m[1].length <= d;
    }
};
function getNumericDatatype(value) {
    return value.termType !== "Literal"
        ? null
        : integerDatatypes.indexOf(value.datatype.value) !== -1
            ? XSD + "integer"
            : numericDatatypes.indexOf(value.datatype.value) !== -1
                ? value.datatype.value
                : null;
}
exports.getNumericDatatype = getNumericDatatype;
function testKnownTypes(value, validationError, ldify, datatype, numeric, label) {
    if (value.termType !== "Literal") {
        validationError(`mismatched datatype: ${JSON.stringify(ldify(value))} is not a literal with datatype ${datatype}`);
    }
    else if (value.datatype.value !== datatype) {
        validationError(`mismatched datatype: ${value.datatype.value} !== ${datatype}`);
    }
    else if (numeric) {
        testRange(numericParsers[numeric](label, validationError), datatype, validationError);
    }
    else if (datatype === XSD + "boolean") {
        if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
            validationError(`illegal boolean value: ${label}`);
    }
    else if (datatype === XSD + "dateTime") {
        if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
            validationError(`illegal dateTime value: ${label}`);
    }
}
exports.testKnownTypes = testKnownTypes;
function testFacets(valueExpr, label, validationError, numeric) {
    if (valueExpr.pattern !== undefined) {
        const regexp = valueExpr.flags !== undefined ?
            new RegExp(valueExpr.pattern, valueExpr.flags) :
            new RegExp(valueExpr.pattern);
        if (!(label.match(regexp)))
            validationError(`value ${label} did not match pattern ${valueExpr.pattern}`);
    }
    for (const [facet, testFunc] of Object.entries(stringTests)) {
        // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
        const facetParm = valueExpr[facet];
        if (facet in valueExpr && !testFunc(label, facetParm)) {
            validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
        }
    }
    for (const [facet, testFunc] of Object.entries(numericValueTests)) {
        if (facet in valueExpr) {
            if (numeric) {
                // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
                const facetParm = valueExpr[facet];
                if (!testFunc(numericParsers[numeric](label, validationError), facetParm)) {
                    validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
                }
            }
            else {
                validationError(`facet violation: numeric facet ${facet} can't apply to ${label}`);
            }
        }
    }
    for (const [facet, testFunc] of Object.entries(decimalLexicalTests)) {
        if (facet in valueExpr) {
            if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
                const normalizedDataValue = String(numericParsers[numeric](label, validationError));
                // @ts-ignore - TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'NodeConstraint'
                const facetParm = valueExpr[facet];
                if (!testFunc(normalizedDataValue, facetParm)) {
                    validationError(`facet violation: expected ${facet} of ${facetParm} but got ${label}`);
                }
            }
            else {
                validationError(`facet violation: numeric facet ${facet} can't apply to ${label}`);
            }
        }
    }
}
exports.testFacets = testFacets;
//# sourceMappingURL=shex-xsd.js.map