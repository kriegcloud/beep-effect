import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface LiquorStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function LiquorStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LiquorStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LiquorStoreClass extends StoreMixin(Resource) {
  }
  return LiquorStoreClass as any
}
LiquorStoreMixin.appliesTo = schema.LiquorStore
LiquorStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<LiquorStore>([StoreMixin, LiquorStoreMixin], { types: [schema.LiquorStore] }, env)
