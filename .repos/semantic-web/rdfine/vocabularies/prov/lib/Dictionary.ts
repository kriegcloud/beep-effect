import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { prov } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Prov from '../index.js';

export interface Dictionary<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  derivedByInsertionFrom: Prov.Dictionary<D> | undefined;
  derivedByRemovalFrom: Prov.Dictionary<D> | undefined;
  hadDictionaryMember: Array<Prov.KeyEntityPair<D>>;
  qualifiedInsertion: Array<Prov.Insertion<D>>;
  qualifiedRemoval: Array<Prov.Removal<D>>;
}

export function DictionaryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Dictionary & RdfResourceCore> & Base {
  @rdfine.namespace(prov)
  class DictionaryClass extends Resource {
    @rdfine.property.resource({ as: [DictionaryMixin] })
    derivedByInsertionFrom: Prov.Dictionary | undefined;
    @rdfine.property.resource({ as: [DictionaryMixin] })
    derivedByRemovalFrom: Prov.Dictionary | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [prov.KeyEntityPair] })
    hadDictionaryMember!: Array<Prov.KeyEntityPair>;
    @rdfine.property.resource({ values: 'array', implicitTypes: [prov.Insertion] })
    qualifiedInsertion!: Array<Prov.Insertion>;
    @rdfine.property.resource({ values: 'array', implicitTypes: [prov.Removal] })
    qualifiedRemoval!: Array<Prov.Removal>;
  }
  return DictionaryClass as any
}
DictionaryMixin.appliesTo = prov.Dictionary
DictionaryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Dictionary>([DictionaryMixin], { types: [prov.Dictionary] }, env)
