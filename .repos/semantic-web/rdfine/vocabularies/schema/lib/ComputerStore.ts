import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ComputerStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ComputerStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComputerStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComputerStoreClass extends StoreMixin(Resource) {
  }
  return ComputerStoreClass as any
}
ComputerStoreMixin.appliesTo = schema.ComputerStore
ComputerStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComputerStore>([StoreMixin, ComputerStoreMixin], { types: [schema.ComputerStore] }, env)
