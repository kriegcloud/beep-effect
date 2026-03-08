import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface OceanBodyOfWater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function OceanBodyOfWaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OceanBodyOfWater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OceanBodyOfWaterClass extends BodyOfWaterMixin(Resource) {
  }
  return OceanBodyOfWaterClass as any
}
OceanBodyOfWaterMixin.appliesTo = schema.OceanBodyOfWater
OceanBodyOfWaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<OceanBodyOfWater>([BodyOfWaterMixin, OceanBodyOfWaterMixin], { types: [schema.OceanBodyOfWater] }, env)
