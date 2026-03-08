import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface ConvenienceStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function ConvenienceStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ConvenienceStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ConvenienceStoreClass extends StoreMixin(Resource) {
  }
  return ConvenienceStoreClass as any
}
ConvenienceStoreMixin.appliesTo = schema.ConvenienceStore
ConvenienceStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<ConvenienceStore>([StoreMixin, ConvenienceStoreMixin], { types: [schema.ConvenienceStore] }, env)
