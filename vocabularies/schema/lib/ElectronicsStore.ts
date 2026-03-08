import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ElectronicsStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ElectronicsStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ElectronicsStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ElectronicsStoreClass extends StoreMixin(Resource) {
  }
  return ElectronicsStoreClass as any
}
ElectronicsStoreMixin.appliesTo = schema.ElectronicsStore
ElectronicsStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ElectronicsStore>([StoreMixin, ElectronicsStoreMixin], { types: [schema.ElectronicsStore] }, env)
