import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface SportingGoodsStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function SportingGoodsStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportingGoodsStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportingGoodsStoreClass extends StoreMixin(Resource) {
  }
  return SportingGoodsStoreClass as any
}
SportingGoodsStoreMixin.appliesTo = schema.SportingGoodsStore
SportingGoodsStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportingGoodsStore>([StoreMixin, SportingGoodsStoreMixin], { types: [schema.SportingGoodsStore] }, env)
