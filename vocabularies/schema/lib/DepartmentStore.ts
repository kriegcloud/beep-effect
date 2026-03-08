import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface DepartmentStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function DepartmentStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DepartmentStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DepartmentStoreClass extends StoreMixin(Resource) {
  }
  return DepartmentStoreClass as any
}
DepartmentStoreMixin.appliesTo = schema.DepartmentStore
DepartmentStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<DepartmentStore>([StoreMixin, DepartmentStoreMixin], { types: [schema.DepartmentStore] }, env)
