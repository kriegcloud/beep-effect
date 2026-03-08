import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface MensClothingStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function MensClothingStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MensClothingStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MensClothingStoreClass extends StoreMixin(Resource) {
  }
  return MensClothingStoreClass as any
}
MensClothingStoreMixin.appliesTo = schema.MensClothingStore
MensClothingStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<MensClothingStore>([StoreMixin, MensClothingStoreMixin], { types: [schema.MensClothingStore] }, env)
