import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface TireShop<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function TireShopMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<TireShop & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class TireShopClass extends StoreMixin(Resource) {
  }
  return TireShopClass as any
}
TireShopMixin.appliesTo = schema.TireShop
TireShopMixin.createFactory = (env: RdfineEnvironment) => createFactory<TireShop>([StoreMixin, TireShopMixin], { types: [schema.TireShop] }, env)
