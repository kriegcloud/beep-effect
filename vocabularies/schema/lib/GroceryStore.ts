import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface GroceryStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function GroceryStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GroceryStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GroceryStoreClass extends StoreMixin(Resource) {
  }
  return GroceryStoreClass as any
}
GroceryStoreMixin.appliesTo = schema.GroceryStore
GroceryStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<GroceryStore>([StoreMixin, GroceryStoreMixin], { types: [schema.GroceryStore] }, env)
