import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface HomeGoodsStore<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function HomeGoodsStoreMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HomeGoodsStore & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HomeGoodsStoreClass extends StoreMixin(Resource) {
  }
  return HomeGoodsStoreClass as any
}
HomeGoodsStoreMixin.appliesTo = schema.HomeGoodsStore
HomeGoodsStoreMixin.createFactory = (env: RdfineEnvironment) => createFactory<HomeGoodsStore>([StoreMixin, HomeGoodsStoreMixin], { types: [schema.HomeGoodsStore] }, env)
