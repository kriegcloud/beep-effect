import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface Winery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function WineryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Winery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WineryClass extends FoodEstablishmentMixin(Resource) {
  }
  return WineryClass as any
}
WineryMixin.appliesTo = schema.Winery
WineryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Winery>([FoodEstablishmentMixin, WineryMixin], { types: [schema.Winery] }, env)
