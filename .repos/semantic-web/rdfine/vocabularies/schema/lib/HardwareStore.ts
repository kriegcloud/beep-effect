import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface HardwareStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function HardwareStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HardwareStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HardwareStoreClass extends StoreMixin(Resource) {
  }
  return HardwareStoreClass as any
}
HardwareStoreMixin.appliesTo = schema.HardwareStore
HardwareStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<HardwareStore>([StoreMixin, HardwareStoreMixin], { types: [schema.HardwareStore] }, env)
