import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { QuantityMixin } from './Quantity.js';

export interface Distance<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Quantity<D>, rdfine.RdfResource<D> {
}

export function DistanceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Distance & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DistanceClass extends QuantityMixin(Resource) {
  }
  return DistanceClass as any
}
DistanceMixin.appliesTo = schema.Distance
DistanceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Distance>([QuantityMixin, DistanceMixin], { types: [schema.Distance] }, env)
