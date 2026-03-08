import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface GardenStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function GardenStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GardenStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GardenStoreClass extends StoreMixin(Resource) {
  }
  return GardenStoreClass as any
}
GardenStoreMixin.appliesTo = schema.GardenStore
GardenStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<GardenStore>([StoreMixin, GardenStoreMixin], { types: [schema.GardenStore] }, env)
