import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface PetStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function PetStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PetStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PetStoreClass extends StoreMixin(Resource) {
  }
  return PetStoreClass as any
}
PetStoreMixin.appliesTo = schema.PetStore
PetStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<PetStore>([StoreMixin, PetStoreMixin], { types: [schema.PetStore] }, env)
