import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FoodEstablishmentMixin } from './FoodEstablishment.js';

export interface Distillery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FoodEstablishment<D>, rdfine.RdfResource<D> {
}

export function DistilleryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Distillery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DistilleryClass extends FoodEstablishmentMixin(Resource) {
  }
  return DistilleryClass as any
}
DistilleryMixin.appliesTo = schema.Distillery
DistilleryMixin.createFactory = (env: RdfineEnvironment) => createFactory<Distillery>([FoodEstablishmentMixin, DistilleryMixin], { types: [schema.Distillery] }, env)
