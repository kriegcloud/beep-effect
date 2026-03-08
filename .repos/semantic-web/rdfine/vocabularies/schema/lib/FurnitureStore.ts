import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface FurnitureStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function FurnitureStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FurnitureStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FurnitureStoreClass extends StoreMixin(Resource) {
  }
  return FurnitureStoreClass as any
}
FurnitureStoreMixin.appliesTo = schema.FurnitureStore
FurnitureStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<FurnitureStore>([StoreMixin, FurnitureStoreMixin], { types: [schema.FurnitureStore] }, env)
