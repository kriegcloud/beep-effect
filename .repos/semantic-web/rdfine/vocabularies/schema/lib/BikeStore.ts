import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface BikeStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function BikeStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BikeStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BikeStoreClass extends StoreMixin(Resource) {
  }
  return BikeStoreClass as any
}
BikeStoreMixin.appliesTo = schema.BikeStore
BikeStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<BikeStore>([StoreMixin, BikeStoreMixin], { types: [schema.BikeStore] }, env)
