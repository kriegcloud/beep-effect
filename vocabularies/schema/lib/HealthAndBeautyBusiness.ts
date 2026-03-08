import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface HealthAndBeautyBusiness<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function HealthAndBeautyBusinessMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HealthAndBeautyBusiness & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HealthAndBeautyBusinessClass extends LocalBusinessMixin(Resource) {
  }
  return HealthAndBeautyBusinessClass as any
}
HealthAndBeautyBusinessMixin.appliesTo = schema.HealthAndBeautyBusiness
HealthAndBeautyBusinessMixin.createFactory = (env: RdfineEnvironment) => createFactory<HealthAndBeautyBusiness>([LocalBusinessMixin, HealthAndBeautyBusinessMixin], { types: [schema.HealthAndBeautyBusiness] }, env)
