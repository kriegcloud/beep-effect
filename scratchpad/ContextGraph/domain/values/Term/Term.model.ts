/**
 * RDF Term type value object for the context graph.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $ScratchpadId } from "@beep/identity";
import { TermType } from "../TermType/index.ts";
import * as S from "effect/Schema";
import { IRI } from "@beep/semantic-web";

const $I = $ScratchpadId.create("values/Term/Term.model");

export class IriTerm extends S.Class<IriTerm>($I`IriTerm`)(
  {
    type: S.tag(TermType.Enum.IRI),
    iri: IRI,
  },
  $I.annote("IriTerm", {
    description: "",
  })
) {}
export declare namespace IriTerm {
  export interface Encoded {
    readonly type: typeof TermType.Enum.IRI;
    readonly iri: typeof IRI.Encoded;
  }
}

export class BlankTerm extends S.Class<BlankTerm>($I`BlankTerm`)(
  {
    type: S.tag(TermType.Enum.BLANK),
    id: S.String,
  },
  $I.annote("BlankTerm", {
    description: "",
  })
) {}

export declare namespace BlankTerm {
  export interface Encoded {
    readonly type: typeof TermType.Enum.BLANK;
    readonly id: string;
  }
}

export class LiteralTerm extends S.Class<LiteralTerm>($I`LiteralTerm`)(
  {
    type: S.tag(TermType.Enum.LITERAL),
    value: S.String,
    datatype: S.OptionFromOptionalKey(S.String),
    language: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("LiteralTerm", {
    description: "",
  })
) {}

export declare namespace LiteralTerm {
  export interface Encoded {
    readonly type: typeof TermType.Enum.LITERAL;
    readonly value: string;
    readonly datatype?: string;
    readonly language?: string;
  }
}

const RecursiveTerm: S.suspend<S.Codec<Term, Term.Encoded>> = S.suspend(
  (): S.Codec<Term, Term.Encoded> => Term
);

export class Triple extends S.Class<Triple>($I`Triple`)(
  {
    s: RecursiveTerm,
    p: RecursiveTerm,
    o: RecursiveTerm,
    g: S.OptionFromOptionalKey(RecursiveTerm),
  },
  $I.annote("Triple", {
    description: "",
  })
) {}

export declare namespace Triple {
  export interface Encoded {
    readonly s: Term.Encoded;
    readonly p: Term.Encoded;
    readonly o: Term.Encoded;
    readonly g?: Term.Encoded;
  }
}

export class TripleTerm extends S.Class<TripleTerm>($I`TripleTerm`)(
  {
    type: S.tag(TermType.Enum.TRIPLE),
    triple: Triple,
  },
  $I.annote("TripleTerm", {
    description: "",
  })
) {}

export declare namespace TripleTerm {
  export interface Encoded {
    readonly type: typeof TermType.Enum.TRIPLE;
    readonly triple: Triple.Encoded;
  }
}

export const Term: S.Codec<Term, Term.Encoded> = S.Union([
  IriTerm,
  BlankTerm,
  LiteralTerm,
  S.suspend((): S.Codec<TripleTerm, TripleTerm.Encoded> => TripleTerm),
]).annotate(
  $I.annote("Term", {
    description: "",
  })
);

export type Term = IriTerm | BlankTerm | LiteralTerm | TripleTerm;

export declare namespace Term {
  export type Encoded = IriTerm.Encoded | BlankTerm.Encoded | LiteralTerm.Encoded | TripleTerm.Encoded;
}
