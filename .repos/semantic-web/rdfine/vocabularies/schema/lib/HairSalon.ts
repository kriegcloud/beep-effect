import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';

export interface HairSalon<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, rdfine.RdfResource<D> {
}

export function HairSalonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<HairSalon & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HairSalonClass extends HealthAndBeautyBusinessMixin(Resource) {
  }
  return HairSalonClass as any
}
HairSalonMixin.appliesTo = schema.HairSalon
HairSalonMixin.createFactory = (env: RdfineEnvironment) => createFactory<HairSalon>([HealthAndBeautyBusinessMixin, HairSalonMixin], { types: [schema.HairSalon] }, env)
