import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface Waterfall<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function WaterfallMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Waterfall & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WaterfallClass extends BodyOfWaterMixin(Resource) {
  }
  return WaterfallClass as any
}
WaterfallMixin.appliesTo = schema.Waterfall
WaterfallMixin.createFactory = (env: RdfineEnvironment) => createFactory<Waterfall>([BodyOfWaterMixin, WaterfallMixin], { types: [schema.Waterfall] }, env)
