import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface LakeBodyOfWater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function LakeBodyOfWaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LakeBodyOfWater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LakeBodyOfWaterClass extends BodyOfWaterMixin(Resource) {
  }
  return LakeBodyOfWaterClass as any
}
LakeBodyOfWaterMixin.appliesTo = schema.LakeBodyOfWater
LakeBodyOfWaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<LakeBodyOfWater>([BodyOfWaterMixin, LakeBodyOfWaterMixin], { types: [schema.LakeBodyOfWater] }, env)
