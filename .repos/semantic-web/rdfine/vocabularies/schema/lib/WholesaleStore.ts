import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface WholesaleStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function WholesaleStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WholesaleStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WholesaleStoreClass extends StoreMixin(Resource) {
  }
  return WholesaleStoreClass as any
}
WholesaleStoreMixin.appliesTo = schema.WholesaleStore
WholesaleStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<WholesaleStore>([StoreMixin, WholesaleStoreMixin], { types: [schema.WholesaleStore] }, env)
