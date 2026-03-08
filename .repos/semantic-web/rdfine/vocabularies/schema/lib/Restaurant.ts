import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface Restaurant<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function RestaurantMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Restaurant & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RestaurantClass extends FoodEstablishmentMixin(Resource) {
  }
  return RestaurantClass as any
}
RestaurantMixin.appliesTo = schema.Restaurant
RestaurantMixin.createFactory = (env: RdfineEnvironment) => createFactory<Restaurant>([FoodEstablishmentMixin, RestaurantMixin], { types: [schema.Restaurant] }, env)
