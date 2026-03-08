import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface Bakery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function BakeryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Bakery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BakeryClass extends FoodEstablishmentMixin(Resource) {
  }
  return BakeryClass as any
}
BakeryMixin.appliesTo = schema.Bakery
BakeryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Bakery>([FoodEstablishmentMixin, BakeryMixin], { types: [schema.Bakery] }, env)
