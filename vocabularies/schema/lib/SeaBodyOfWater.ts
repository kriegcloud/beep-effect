import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface SeaBodyOfWater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function SeaBodyOfWaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SeaBodyOfWater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SeaBodyOfWaterClass extends BodyOfWaterMixin(Resource) {
  }
  return SeaBodyOfWaterClass as any
}
SeaBodyOfWaterMixin.appliesTo = schema.SeaBodyOfWater
SeaBodyOfWaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<SeaBodyOfWater>([BodyOfWaterMixin, SeaBodyOfWaterMixin], { types: [schema.SeaBodyOfWater] }, env)
