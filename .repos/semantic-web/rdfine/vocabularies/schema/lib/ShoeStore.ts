import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ShoeStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ShoeStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ShoeStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ShoeStoreClass extends StoreMixin(Resource) {
  }
  return ShoeStoreClass as any
}
ShoeStoreMixin.appliesTo = schema.ShoeStore
ShoeStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ShoeStore>([StoreMixin, ShoeStoreMixin], { types: [schema.ShoeStore] }, env)
