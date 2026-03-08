import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { StoreMixin } from './Store.js';

export interface HobbyShop<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Store<D>, rdfine.RdfResource<D> {
}

export function HobbyShopMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HobbyShop & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HobbyShopClass extends StoreMixin(Resource) {
  }
  return HobbyShopClass as any
}
HobbyShopMixin.appliesTo = schema.HobbyShop
HobbyShopMixin.createFactory = (env: RdfineEnvironment) => createFactory<HobbyShop>([StoreMixin, HobbyShopMixin], { types: [schema.HobbyShop] }, env)
