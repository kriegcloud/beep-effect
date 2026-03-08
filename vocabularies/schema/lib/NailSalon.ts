import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HealthAndBeautyBusinessMixin } from './HealthAndBeautyBusiness.js';

export interface NailSalon<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HealthAndBeautyBusiness<D>, rdfine.RdfResource<D> {
}

export function NailSalonMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<NailSalon & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class NailSalonClass extends HealthAndBeautyBusinessMixin(Resource) {
  }
  return NailSalonClass as any
}
NailSalonMixin.appliesTo = schema.NailSalon
NailSalonMixin.createFactory = (env: RdfineEnvironment) => createFactory<NailSalon>([HealthAndBeautyBusinessMixin, NailSalonMixin], { types: [schema.NailSalon] }, env)
