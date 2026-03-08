import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';

export interface DaySpa<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, rdfine.RdfResource<D> {
}

export function DaySpaMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DaySpa & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DaySpaClass extends HealthAndBeautyBusinessMixin(Resource) {
  }
  return DaySpaClass as any
}
DaySpaMixin.appliesTo = schema.DaySpa
DaySpaMixin.createFactory = (env: RdfineEnvironment) => createFactory<DaySpa>([HealthAndBeautyBusinessMixin, DaySpaMixin], { types: [schema.DaySpa] }, env)
