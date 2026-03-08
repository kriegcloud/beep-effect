import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface Canal<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function CanalMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Canal & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CanalClass extends BodyOfWaterMixin(Resource) {
  }
  return CanalClass as any
}
CanalMixin.appliesTo = schema.Canal
CanalMixin.createFactory = (env: RdfineEnvironment) => createFactory<Canal>([BodyOfWaterMixin, CanalMixin], { types: [schema.Canal] }, env)
