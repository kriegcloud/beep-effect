import { $SemanticWebId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { BlankNode, DefaultGraph, Literal, NamedNode, Quad, Variable } from "@beep/semantic-web/rdf/models";
import { LanguageDirection, LanguageOptions } from "@beep/semantic-web/rdf/values";
import type { IRIString } from "@beep/semantic-web/uri/uri";
import { thunkZero } from "@beep/utils";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("Factory");
const dirLangStringDatatype = NamedNode.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString");
const langStringDatatype = NamedNode.new("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
const stringDatatype = NamedNode.new("http://www.w3.org/2001/XMLSchema#string");

export class FactoryState extends S.Class<FactoryState>($I`FactoryState`)(
  {
    state: S.optionalWith(
      S.Struct({
        blankNodeCounter: S.optional(S.NonNegativeInt).pipe(
          S.withDefaults({
            constructor: thunkZero,
            decoding: thunkZero,
          })
        ),
        defaultGraph: DefaultGraph.pipe(
          S.optional,
          S.withDefaults({
            decoding: () => new DefaultGraph({}),
            constructor: () => new DefaultGraph({}),
          })
        ),
      }).pipe(S.mutable),
      {
        default: () => ({
          blankNodeCounter: 0,
          defaultGraph: new DefaultGraph({}),
        }),
      }
    ),
  },
  $I.annotations("FactoryState", {
    description: "state of the factory.",
  })
) {}

export class FactoryExports extends BS.StringLiteralKit(
  "blankNode",
  "defaultGraph",
  "fromQuad",
  "fromTerm",
  "literal",
  "namedNode",
  "quad",
  "variable"
).annotations(
  $I.annotations("FactoryExports", {
    description: "exports of the factory.",
  })
) {}

export declare namespace FactoryExports {
  export type Type = typeof FactoryExports.Type;
}

export class DataFactory extends Data.Class<{
  _data: FactoryState;
}> {
  constructor(_data = new FactoryState()) {
    super({ _data });
  }

  readonly namedNode = (value: IRIString.Type) => {
    return NamedNode.new(value);
  };

  readonly blankNode = (value?: undefined | string) => {
    const id = value || `b${++this._data.state.blankNodeCounter}`;
    return BlankNode.new(id);
  };

  readonly literal = (value = "", languageOrDataType?: undefined | NamedNode | LanguageOptions | null): Literal => {
    if (P.isString(languageOrDataType)) {
      return Literal.new(value, languageOrDataType, langStringDatatype);
    }
    if (
      S.is(LanguageOptions)(languageOrDataType) &&
      P.struct({
        language: P.isString,
      })(languageOrDataType)
    ) {
      const opts = languageOrDataType;
      return Literal.new(
        value,
        opts.language,
        opts.direction ? dirLangStringDatatype : langStringDatatype,
        opts.direction.pipe(O.getOrElse(() => LanguageDirection.Enum[""]))
      );
    }
    const dataType = F.pipe(
      languageOrDataType,
      O.liftPredicate(S.is(NamedNode)),
      O.getOrElse(() => stringDatatype)
    );
    return Literal.new(value, "", dataType);
  };

  readonly variable = Variable.new;

  readonly defaultGraph = () => this._data.state.defaultGraph;

  readonly quad = (subject: unknown, predicate: unknown, object: unknown, graph: unknown = this.defaultGraph()) => {
    return Quad.new(subject, predicate, object, graph);
  };
}
