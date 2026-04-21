/**
 * Wire format transforms — client compact format ↔ internal verbose format.
 *
 * Client uses compact keys (`t`, `i`, `v`, etc.) to minimize payload size.
 * Internal services use verbose keys (`type`, `iri`, `value`, etc.).
 *
 * @module
 * @since 0.1.0
 */

import type { Primitives } from "@beep/graph-schema";
import * as O from "effect/Option";

// ---------------------------------------------------------------------------
// Compact (client) term format
// ---------------------------------------------------------------------------

interface CompactIri {
  readonly i: string;
  readonly t: "i";
}

interface CompactBlank {
  readonly d: string;
  readonly t: "b";
}

interface CompactLiteral {
  readonly dt?: string;
  readonly ln?: string;
  readonly t: "l";
  readonly v: string;
}

interface CompactTriple {
  readonly t: "t";
  readonly tr?: { readonly s: CompactTerm; readonly p: CompactTerm; readonly o: CompactTerm };
}

type CompactTerm = CompactIri | CompactBlank | CompactLiteral | CompactTriple;

interface CompactTripleStruct {
  readonly o: CompactTerm;
  readonly p: CompactTerm;
  readonly s: CompactTerm;
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

/**
 * Convert verbose internal term to compact client format.
 *
 * @since 0.1.0
 * @category transforms
 */
export const termToCompact = (term: Primitives.Term): CompactTerm => {
  switch (term.type) {
    case "IRI":
      return { t: "i", i: term.iri };
    case "BLANK":
      return { t: "b", d: term.id };
    case "LITERAL":
      return {
        t: "l",
        v: term.value,
        ...(O.isSome(term.datatype) ? { dt: term.datatype.value } : {}),
        ...(O.isSome(term.language) ? { ln: term.language.value } : {}),
      };
    case "TRIPLE":
      return {
        t: "t",
        tr: {
          s: termToCompact(term.triple.s),
          p: termToCompact(term.triple.p),
          o: termToCompact(term.triple.o),
        },
      };
  }
};

/**
 * Convert compact client term to verbose internal format.
 *
 * @since 0.1.0
 * @category transforms
 */
export const termFromCompact = (compact: CompactTerm): Primitives.Term => {
  switch (compact.t) {
    case "i":
      return { type: "IRI", iri: compact.i };
    case "b":
      return { type: "BLANK", id: compact.d };
    case "l":
      return {
        type: "LITERAL",
        value: compact.v,
        datatype: compact.dt === undefined ? O.none() : O.some(compact.dt),
        language: compact.ln === undefined ? O.none() : O.some(compact.ln),
      };
    case "t":
      return {
        type: "TRIPLE",
        triple:
          compact.tr !== undefined
            ? {
                g: O.none(),
                s: termFromCompact(compact.tr.s),
                p: termFromCompact(compact.tr.p),
                o: termFromCompact(compact.tr.o),
              }
            : {
                g: O.none(),
                s: { type: "BLANK", id: "" },
                p: { type: "BLANK", id: "" },
                o: { type: "BLANK", id: "" },
              },
      };
  }
};

/**
 * Convert verbose triple to compact format.
 *
 * @since 0.1.0
 * @category transforms
 */
export const tripleToCompact = (triple: Primitives.Triple): CompactTripleStruct => ({
  s: termToCompact(triple.s),
  p: termToCompact(triple.p),
  o: termToCompact(triple.o),
});

/**
 * Convert compact triple to verbose format.
 *
 * @since 0.1.0
 * @category transforms
 */
export const tripleFromCompact = (compact: CompactTripleStruct): Primitives.Triple => ({
  g: O.none(),
  s: termFromCompact(compact.s),
  p: termFromCompact(compact.p),
  o: termFromCompact(compact.o),
});
