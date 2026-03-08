import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  Path,
  PathAlternativeLimited,
  PathModified,
  PathNegated,
  PathNegatedElt,
  PropertyPathChain,
  TermIri,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'path';
const nodeType: NodeType = 'path';

type RawNegatedElt = SubTyped<NodeType, '^'> & { items: [SubTyped<'term', 'namedNode'>]};

// eslint-disable-next-line ts/explicit-function-return-type
export function PathFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class PathFactory extends Base {
    public isPathPure(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public path(
      subType: '|',
      items: (TermIri | PathNegatedElt)[],
      loc: SourceLocation
    ): PathAlternativeLimited;
    public path(
      subType: '!',
      items: [TermIri | PathNegatedElt | PathAlternativeLimited],
      loc: SourceLocation
    ): PathNegated;
    public path(subType: '^', items: [TermIri], loc: SourceLocation): PathNegatedElt;
    public path(subType: PathModified['subType'], item: [Path], loc: SourceLocation): PathModified;
    public path(subType: '|' | '/', items: Path[], loc: SourceLocation):
    PropertyPathChain;
    public path(
      subType: (PropertyPathChain | PathModified | PathNegated)['subType'],
      items: Path[],
      loc: SourceLocation,
    ): Path {
      const base = <const>{
        type: nodeType,
        loc,
        items,
      };
      if (subType === '|' || subType === '/') {
        return {
          ...base,
          subType,
        } satisfies PropertyPathChain;
      }
      if ((subType === '?' || subType === '*' || subType === '+' || subType === '^') && items.length === 1) {
        return {
          ...base,
          subType,
          items: <[Path]>items,
        } satisfies PathModified;
      }
      if (subType === '^' && items.length === 1 && !this.isPathPure(items[0])) {
        return {
          ...base,
          subType,
          items: <[TermIri]>items,
        } satisfies PathNegatedElt;
      }
      if (subType === '!' && items.length === 1 && (
        this.isPathAlternativeLimited(items[0]) || !this.isPathPure(items[0]) || this.isPathNegatedElt(items[0]))) {
        return {
          ...base,
          subType,
          items: <[TermIri | PathNegatedElt | PathAlternativeLimited]>items,
        } satisfies PathNegated;
      }
      throw new Error('Invalid path type');
    }

    public isPathOfType<T extends U[], U extends string>(obj: object, subTypes: T): obj is SubTyped<NodeType, U> {
      return this.isOfType(obj, nodeType) && subTypes.includes(<any>(<{ subType?: unknown }>obj).subType);
    }

    public isPathChain(obj: object): obj is SubTyped<NodeType, '|' | '/'> {
      return this.isOfSubType(obj, nodeType, '/') || this.isOfSubType(obj, nodeType, '|');
    }

    public isPathModified(obj: object): obj is SubTyped<NodeType, '?' | '*' | '+' | '^'> {
      return this.isOfSubType(obj, nodeType, '?') || this.isOfSubType(obj, nodeType, '*') ||
        this.isOfSubType(obj, nodeType, '+') || this.isOfSubType(obj, nodeType, '^');
    }

    public isPathNegatedElt(obj: object): obj is RawNegatedElt {
      const casted: { items?: unknown } = obj;
      return this.isOfSubType(obj, nodeType, '^') && Array.isArray(casted.items) && casted.items.length === 1 &&
        typeof casted.items[0] === 'object' && (casted.items[0] ?? false) && !this.isPathPure(casted.items[0]);
    }

    public isPathNegated(obj: object): obj is SubTyped<NodeType, '!'> {
      return this.isOfSubType(obj, nodeType, '!');
    }

    public isPathAlternativeLimited(obj: object):
      obj is SubTyped<NodeType, '|'> & { items: (SubTyped<'term', 'namedNode'> | RawNegatedElt)[] } {
      const casted: { items?: unknown } = obj;
      return this.isOfSubType(obj, nodeType, '|') && Array.isArray(casted.items) &&
        casted.items.every(item => !this.isPathPure(item) || this.isPathNegatedElt(item));
    }
  };
}
