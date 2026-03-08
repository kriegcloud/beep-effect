import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface RoofingContractor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function RoofingContractorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<RoofingContractor & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class RoofingContractorClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return RoofingContractorClass as any
}
RoofingContractorMixin.appliesTo = schema.RoofingContractor
RoofingContractorMixin.createFactory = (env: RdfineEnvironment) => createFactory<RoofingContractor>([HomeAndConstructionBusinessMixin, RoofingContractorMixin], { types: [schema.RoofingContractor] }, env)
