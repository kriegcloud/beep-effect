import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface MusicStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function MusicStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MusicStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MusicStoreClass extends StoreMixin(Resource) {
  }
  return MusicStoreClass as any
}
MusicStoreMixin.appliesTo = schema.MusicStore
MusicStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<MusicStore>([StoreMixin, MusicStoreMixin], { types: [schema.MusicStore] }, env)
