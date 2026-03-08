"use strict";
/**
 * Terms used in ShEx.
 *
 * There are three representations of RDF terms used in ShEx NamedNode validation and applications:
 * 1. LD (short for JSON-LD) @ids used in ShExJ.
 *   "http://a.example/some/Iri
 *   "_:someBlankNode
 *   { "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "value": "chat", "language": "fr" }
 * 2. RdfJs Terms [RdfJsTerm] specification used in validation
 *   { "termType": "NamedNode": "value": "http://a.example/some/Iri" }
 *   { "termType": "BlankNode": "value": "someBlankNode" }
 *   { "termType": "Literal": "value": "1.0", "datatype": "http://www.w3.org/2001/XMLSchema#float" }
 *   { "termType": "Literal": "value": "chat", "language": "fr" }
 * 3. Turtle representation is used for human interfaces
 *   <http://a.example/some/Iri>, p:IRI, p:, :
 *   _:someBlankNode, []
 *   "1.0"^^<http://www.w3.org/2001/XMLSchema#float>, "1.0"^^xsd:float, 1.0
 *   "chat"@fr
 *   "1.0"^^http://www.w3.org/2001/XMLSchema#float
 *
 * [RdfJsTerm](https://rdf.js.org/data-model-spec/#term-interface)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rdfJsTerm2Ld = exports.ld2RdfJsTerm = exports.shExJsTerm2Turtle = exports.rdfJsTerm2Turtle = exports.Terminals = exports.XsdString = exports.RdfLangString = void 0;
const RelativizeIri = require("relativize-url").relativize;
// import {relativize as RelativizeIri} from "relativize-url"; // someone should lecture the maintainer
const rdf_data_factory_1 = require("rdf-data-factory");
const RdfJsFactory = new rdf_data_factory_1.DataFactory();
exports.RdfLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
exports.XsdString = "http://www.w3.org/2001/XMLSchema#string";
const PN_CHARS_BASE = "A-Za-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}"; // escape anything outside BMP: \u{10000}-\u{EFFFF}
const PN_CHARS_U = PN_CHARS_BASE + "_";
const PN_CHARS_WO_HYPHEN = PN_CHARS_U + "0-9\u{B7}\u{300}-\u{36F}\u{203F}-\u{2040}";
const PN_PREFIX = [PN_CHARS_BASE, PN_CHARS_WO_HYPHEN + '.-', PN_CHARS_WO_HYPHEN + '-'];
const PN_LOCAL = [
    PN_CHARS_U + ":0-9",
    PN_CHARS_WO_HYPHEN + ".:-",
    PN_CHARS_WO_HYPHEN + ":-"
];
exports.Terminals = {
    Turtle: {
        PN_CHARS_BASE,
        PN_CHARS_U,
        PN_CHARS_WO_HYPHEN,
        PN_PREFIX,
        PN_LOCAL,
    }
};
function rdfJsTerm2Turtle(node, meta) {
    switch (node.termType) {
        case ("NamedNode"):
            return iri2Turtle(node.value, meta);
        case ("BlankNode"):
            return "_:" + node.value;
        case ("Literal"):
            return "\"" + node.value.replace(/"/g, '\\"') + "\"" + (node.datatype.value === exports.RdfLangString
                ? "@" + node.language
                : node.datatype.value === exports.XsdString
                    ? ""
                    : "^^" + node.datatype.value);
        default: throw Error(`rdfJsTerm2Turtle: unknown RDFJS node type: ${JSON.stringify(node)}`);
    }
}
exports.rdfJsTerm2Turtle = rdfJsTerm2Turtle;
function shExJsTerm2Turtle(node, meta = { base: "", prefixes: {} }, aForType) {
    if (typeof node === "string") {
        if (node.startsWith("_:")) {
            return node;
        }
        else {
            return iri2Turtle(node, meta, aForType);
        }
    }
    else if (typeof node === "object" && "value" in node) {
        let value = node.value;
        const type = node.type;
        const language = node.language;
        // Escape special characters
        if (escape.test(value))
            value = value.replace(escapeAll, characterReplacer);
        // Write the literal, possibly with type or language
        if (language)
            return '"' + value + '"@' + language;
        else if (type && type !== "http://www.w3.org/2001/XMLSchema#string")
            return '"' + value + '"^^' + iri2Turtle(type, meta, false);
        else
            return '"' + value + '"';
    }
    else {
        throw Error("Unknown internal term type: " + JSON.stringify(node));
    }
}
exports.shExJsTerm2Turtle = shExJsTerm2Turtle;
// Characters in literals that require escaping
const escape = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/;
const escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g;
const escapeReplacements = {
    '\\': '\\\\', '"': '\\"', '\t': '\\t',
    '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
};
// Replaces a character by its escaped version
function characterReplacer(character) {
    // Replace a single character by its escaped version
    let result = escapeReplacements[character]; // @@ const should be let
    if (result === undefined) {
        // Replace a single character with its 4-bit unicode escape sequence
        if (character.length === 1) {
            result = character.charCodeAt(0).toString(16);
            result = '\\u0000'.substr(0, 6 - result.length) + result;
        }
        // Replace a surrogate pair with its 8-bit unicode escape sequence
        else {
            result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
                character.charCodeAt(1) + 0x2400).toString(16);
            result = '\\U00000000'.substr(0, 10 - result.length) + result;
        }
    }
    return result;
}
function ld2RdfJsTerm(ld) {
    switch (typeof ld) {
        case 'object':
            const copy = JSON.parse(JSON.stringify(ld));
            if (!copy.value)
                throw Error(`JSON-LD-style object literal has no value: ${JSON.stringify(ld)}`);
            const value = copy.value;
            delete copy.value;
            if (copy.language)
                return RdfJsFactory.literal(value, copy.language);
            if (copy.type)
                return RdfJsFactory.literal(value, RdfJsFactory.namedNode(copy.type));
            if (Object.keys(copy).length > 0)
                throw Error(`Unrecognized attributes in JSON-LD-style object literal: ${JSON.stringify(Object.keys(copy))}`);
            return RdfJsFactory.literal(value);
        case 'string':
            return ld.startsWith('_:')
                ? RdfJsFactory.blankNode(ld.substr(2))
                : RdfJsFactory.namedNode(ld);
        default: throw Error(`Unrecognized JSON-LD-style term: ${JSON.stringify(ld)}`);
    }
}
exports.ld2RdfJsTerm = ld2RdfJsTerm;
function rdfJsTerm2Ld(term) {
    switch (term.termType) {
        case "NamedNode": return term.value;
        case "BlankNode": return "_:" + term.value;
        case "Literal":
            const ret = { value: term.value };
            const dt = term.datatype.value;
            const lang = term.language;
            if (dt &&
                dt !== "http://www.w3.org/2001/XMLSchema#string" &&
                dt !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString")
                ret.type = dt;
            if (lang)
                ret.language = lang;
            return ret;
        default:
            throw Error(`Unrecognized termType ${term.termType} ${term.value}`);
    }
}
exports.rdfJsTerm2Ld = rdfJsTerm2Ld;
function iri2Turtle(iri, meta = { base: "", prefixes: {} }, aForType = true) {
    const { base, prefixes = {} } = meta;
    if (aForType && iri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
        return "a";
    const rel = "<" + (base.length > 0 ? RelativizeIri(iri, base) : iri) + ">";
    for (const prefix in prefixes) {
        const ns = prefixes[prefix];
        if (iri.startsWith(ns)) {
            const localName = iri.substr(ns.length);
            const first = localName.slice(0, 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[0] + "]", "g"), s => '\\' + s);
            const middle = localName.slice(1, localName.length - 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[1] + "]", "g"), s => '\\' + s);
            const last = localName.length > 1 ? localName.slice(localName.length - 1).replaceAll(new RegExp("[^" + exports.Terminals.Turtle.PN_LOCAL[2] + "]", "g"), s => '\\' + s) : '';
            const pName = prefix + ':' + first + middle + last;
            if (pName.length < rel.length)
                return pName;
        }
    }
    return rel;
}
//# sourceMappingURL=shex-term.js.map