import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LandformMixin } from './Landform.js';

export interface BodyOfWater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Landform<D>, rdfine.RdfResource<D> {
}

export function BodyOfWaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BodyOfWater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BodyOfWaterClass extends LandformMixin(Resource) {
  }
  return BodyOfWaterClass as any
}
BodyOfWaterMixin.appliesTo = schema.BodyOfWater
BodyOfWaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<BodyOfWater>([LandformMixin, BodyOfWaterMixin], { types: [schema.BodyOfWater] }, env)
