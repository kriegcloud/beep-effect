import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  TermBlank,
  TermIri,
  TermIriFull,
  TermIriPrefixed,
  TermLiteral,
  TermLiteralLangStr,
  TermLiteralStr,
  TermLiteralTyped,
  TermVariable,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'term';
const nodeType: NodeType = 'term';

// eslint-disable-next-line ts/explicit-function-return-type
export function TermFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class TermFactory extends Base {
    public __blankNodeCounter = 0;

    public resetBlankNodeCounter(): void {
      this.__blankNodeCounter = 0;
    }

    public isTerm(x: object): x is Typed<'term'> {
      return this.isOfType(x, 'term');
    }

    public termBlank(label: undefined | string, loc: SourceLocation): TermBlank {
      const base = <const>{
        type: 'term',
        subType: 'blankNode',
        loc,
      };
      if (label === undefined) {
        return { ...base, label: `g_${this.__blankNodeCounter++}` };
      }
      return { ...base, label: `e_${label}` };
    }

    public isTermBlank(obj: object): obj is SubTyped<NodeType, 'blankNode'> {
      return this.isOfSubType(obj, nodeType, 'blankNode');
    }

    /**
     * String, no lang, no type
     */
    public termLiteral(loc: SourceLocation, value: string, lang?: undefined): TermLiteralStr;
    /**
     * String with a language tag
     */
    public termLiteral(loc: SourceLocation, value: string, lang: string): TermLiteralLangStr;
    /**
     * Lexical form with a type
     */
    public termLiteral(loc: SourceLocation, value: string, iri: TermIri): TermLiteralTyped;
    public termLiteral(loc: SourceLocation, value: string, langOrIri?: string | TermIri): TermLiteral;
    public termLiteral(loc: SourceLocation, value: string, langOrIri?: string | TermIri): TermLiteral {
      return {
        type: nodeType,
        subType: 'literal',
        value,
        langOrIri,
        loc,
      };
    }

    public isTermLiteral(obj: object): obj is SubTyped<NodeType, 'literal'> {
      return this.isOfSubType(obj, nodeType, 'literal');
    }

    public isTermLiteralLangStr(obj: object): obj is SubTyped<NodeType, 'literal'> & { langOrIri: string } {
      return this.isTermLiteral(obj) && typeof (<{ langOrIri?: unknown }>obj).langOrIri === 'string';
    }

    public isTermLiteralStr(obj: object): obj is SubTyped<NodeType, 'literal'> & { langOrIri: undefined } {
      return this.isTermLiteral(obj) && typeof (<{ langOrIri?: unknown }>obj).langOrIri === 'undefined';
    }

    public isTermLiteralTyped(obj: object):
      obj is SubTyped<NodeType, 'literal'> & { langOrIri: SubTyped<NodeType, 'namedNode'> } {
      const casted = <{ langOrIri?: unknown }>obj;
      return this.isTermLiteral(obj) && typeof casted.langOrIri === 'object' &&
        casted.langOrIri !== null && this.isTermNamed(casted.langOrIri);
    }

    public termVariable(value: string, loc: SourceLocation): TermVariable {
      return {
        type: nodeType,
        subType: 'variable',
        value,
        loc,
      };
    }

    public isTermVariable(obj: object): obj is SubTyped<NodeType, 'variable'> {
      return this.isOfSubType(obj, nodeType, 'variable');
    }

    /**
     * A namednode with fully defined with a uri.
     */
    public termNamed(loc: SourceLocation, value: string, prefix?: undefined): TermIriFull;
    /**
     * A namednode defined using a prefix
     */
    public termNamed(loc: SourceLocation, value: string, prefix: string): TermIriPrefixed;
    public termNamed(loc: SourceLocation, value: string, prefix?: string): TermIriFull | TermIriPrefixed {
      const base = <const>{
        type: nodeType,
        subType: 'namedNode',
        value,
        loc,
      };
      if (prefix === undefined) {
        return base;
      }
      return { ...base, prefix };
    }

    public isTermNamed(obj: object): obj is SubTyped<NodeType, 'namedNode'> {
      return this.isOfSubType(obj, nodeType, 'namedNode');
    }

    public isTermNamedPrefixed(obj: object): obj is SubTyped<NodeType, 'namedNode'> & { prefix: string } {
      const casted = <{ prefix?: unknown }>obj;
      return this.isTermNamed(obj) && typeof casted.prefix === 'string';
    }
  };
}
