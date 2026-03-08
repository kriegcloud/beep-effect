import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface JewelryStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function JewelryStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JewelryStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class JewelryStoreClass extends StoreMixin(Resource) {
  }
  return JewelryStoreClass as any
}
JewelryStoreMixin.appliesTo = schema.JewelryStore
JewelryStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<JewelryStore>([StoreMixin, JewelryStoreMixin], { types: [schema.JewelryStore] }, env)
