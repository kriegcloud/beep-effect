import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface Reservoir<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function ReservoirMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Reservoir & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReservoirClass extends BodyOfWaterMixin(Resource) {
  }
  return ReservoirClass as any
}
ReservoirMixin.appliesTo = schema.Reservoir
ReservoirMixin.createFactory = (env: RdfineEnvironment) => createFactory<Reservoir>([BodyOfWaterMixin, ReservoirMixin], { types: [schema.Reservoir] }, env)
