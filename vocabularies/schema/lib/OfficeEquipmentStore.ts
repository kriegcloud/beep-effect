import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface OfficeEquipmentStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function OfficeEquipmentStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OfficeEquipmentStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OfficeEquipmentStoreClass extends StoreMixin(Resource) {
  }
  return OfficeEquipmentStoreClass as any
}
OfficeEquipmentStoreMixin.appliesTo = schema.OfficeEquipmentStore
OfficeEquipmentStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<OfficeEquipmentStore>([StoreMixin, OfficeEquipmentStoreMixin], { types: [schema.OfficeEquipmentStore] }, env)
