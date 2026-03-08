import type { Constructor } from '@tpluscode/rdfine'
import { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type { Collection, MemberAssertion } from '../index.js'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { property } from '@tpluscode/rdfine';
import type * as RDF from '@rdfjs/types';
import { MemberAssertionMixin } from '../extensions/MemberAssertion.js';

export interface CollectionEx<D extends RDF.DatasetCore = RDF.DatasetCore> {
  manages: Array<MemberAssertion<D>>;
  memberAssertion: Array<MemberAssertion<D>>;
}

declare module '@rdfine/hydra' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Collection<M extends RdfResourceCore<any> = RdfResourceCore<any>, D extends RDF.DatasetCore = RDF.DatasetCore> extends CollectionEx<D> {
  }
}

export function CollectionExMixin<Base extends Constructor<Partial<Omit<Collection, keyof CollectionEx>> & RdfResourceCore>>(base: Base): Constructor<RdfResourceCore & CollectionEx> & Base {
  class CollectionExClass extends base implements CollectionEx {
    @property.resource({ path: hydra.manages, as: [MemberAssertionMixin], values: 'array' })
    manages!: Array<MemberAssertion>
    @property.resource({ values: 'array', as: [MemberAssertionMixin] })
    memberAssertion!: Array<MemberAssertion>;
  }

  return CollectionExClass
}

CollectionExMixin.appliesTo = hydra.Collection
