import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BodyOfWaterMixin } from './BodyOfWater.js';

export interface Pond<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BodyOfWater<D>, rdfine.RdfResource<D> {
}

export function PondMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Pond & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PondClass extends BodyOfWaterMixin(Resource) {
  }
  return PondClass as any
}
PondMixin.appliesTo = schema.Pond
PondMixin.createFactory = (env: RdfineEnvironment) => createFactory<Pond>([BodyOfWaterMixin, PondMixin], { types: [schema.Pond] }, env)
