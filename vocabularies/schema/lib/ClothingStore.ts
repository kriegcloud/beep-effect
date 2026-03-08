import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ClothingStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ClothingStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ClothingStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ClothingStoreClass extends StoreMixin(Resource) {
  }
  return ClothingStoreClass as any
}
ClothingStoreMixin.appliesTo = schema.ClothingStore
ClothingStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ClothingStore>([StoreMixin, ClothingStoreMixin], { types: [schema.ClothingStore] }, env)
