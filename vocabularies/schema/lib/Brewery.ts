import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface Brewery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function BreweryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Brewery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BreweryClass extends FoodEstablishmentMixin(Resource) {
  }
  return BreweryClass as any
}
BreweryMixin.appliesTo = schema.Brewery
BreweryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Brewery>([FoodEstablishmentMixin, BreweryMixin], { types: [schema.Brewery] }, env)
