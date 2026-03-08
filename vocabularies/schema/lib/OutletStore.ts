import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface OutletStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function OutletStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OutletStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OutletStoreClass extends StoreMixin(Resource) {
  }
  return OutletStoreClass as any
}
OutletStoreMixin.appliesTo = schema.OutletStore
OutletStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<OutletStore>([StoreMixin, OutletStoreMixin], { types: [schema.OutletStore] }, env)
