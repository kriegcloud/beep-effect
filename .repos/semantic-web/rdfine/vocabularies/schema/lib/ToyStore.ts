import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ToyStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ToyStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ToyStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ToyStoreClass extends StoreMixin(Resource) {
  }
  return ToyStoreClass as any
}
ToyStoreMixin.appliesTo = schema.ToyStore
ToyStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ToyStore>([StoreMixin, ToyStoreMixin], { types: [schema.ToyStore] }, env)
