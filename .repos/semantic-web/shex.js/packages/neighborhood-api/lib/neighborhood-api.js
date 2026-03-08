"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparqlOrder = exports.Start = void 0;
exports.Start = { term: "START" };
/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder(l, r) {
    const [lprec, rprec] = [prec(l), prec(r)];
    return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}
exports.sparqlOrder = sparqlOrder;
const termType2Prec = {
    'BlankNode': 1,
    'Literal': 2,
    'NamedNode': 3,
};
function prec(t) {
    let typeLabel = t.termType;
    if (typeLabel === 'Quad' || typeLabel === 'Variable' || typeLabel === 'DefaultGraph')
        throw Error(`no defined SPARQL order for ${typeLabel} ${t.value}`);
    return termType2Prec[typeLabel];
}
