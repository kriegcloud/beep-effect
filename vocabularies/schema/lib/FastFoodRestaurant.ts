import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface FastFoodRestaurant<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function FastFoodRestaurantMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FastFoodRestaurant & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FastFoodRestaurantClass extends FoodEstablishmentMixin(Resource) {
  }
  return FastFoodRestaurantClass as any
}
FastFoodRestaurantMixin.appliesTo = schema.FastFoodRestaurant
FastFoodRestaurantMixin.createFactory = (env: RdfineEnvironment) => createFactory<FastFoodRestaurant>([FoodEstablishmentMixin, FastFoodRestaurantMixin], { types: [schema.FastFoodRestaurant] }, env)
