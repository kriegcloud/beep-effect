/** API called by @shexjs/validator to get a neighborhood (arcs in and out of a node)
 */
import {Shape} from 'shexj';
import * as RdfJs from "@rdfjs/types/data-model";
import {Term as RdfJsTerm} from "@rdfjs/types/data-model";
export const Start = { term: "START" }

export {};

export interface Neighborhood {
  incoming: RdfJs.Quad[];
  outgoing: RdfJs.Quad[];
}

export interface NeighborhoodDb {
  getSubjects(): RdfJs.Term[];
  getPredicates(): RdfJs.Term[];
  getObjects(): RdfJs.Term[];
  getQuads(): RdfJs.Quad[];
  getNeighborhood (point: RdfJs.Term, shapeLabel: string | typeof Start, shape: Shape): Neighborhood;
  get size(): number
}

/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
export function sparqlOrder (l: RdfJsTerm, r: RdfJsTerm): number {
  const [lprec, rprec] = [prec(l), prec(r)];
  return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}

const termType2Prec: {
  [key in 'BlankNode' | 'NamedNode' | 'Literal']: number
} = {
  'BlankNode': 1,
  'Literal': 2,
  'NamedNode': 3,
}

function prec (t: RdfJsTerm) : number {
  let typeLabel = t.termType;
  if (typeLabel === 'Quad' || typeLabel === 'Variable' || typeLabel === 'DefaultGraph')
    throw Error(`no defined SPARQL order for ${typeLabel} ${t.value}`)
  return termType2Prec[typeLabel];
}

