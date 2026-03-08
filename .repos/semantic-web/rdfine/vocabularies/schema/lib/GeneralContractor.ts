import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { HomeAndConstructionBusinessMixin } from './HomeAndConstructionBusiness.js';

export interface GeneralContractor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.HomeAndConstructionBusiness<D>, rdfine.RdfResource<D> {
}

export function GeneralContractorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GeneralContractor & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GeneralContractorClass extends HomeAndConstructionBusinessMixin(Resource) {
  }
  return GeneralContractorClass as any
}
GeneralContractorMixin.appliesTo = schema.GeneralContractor
GeneralContractorMixin.createFactory = (env: RdfineEnvironment) => createFactory<GeneralContractor>([HomeAndConstructionBusinessMixin, GeneralContractorMixin], { types: [schema.GeneralContractor] }, env)
