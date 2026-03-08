import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialServiceMixin } from './FinancialService.js';

export interface InsuranceAgency<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialService<D>, rdfine.RdfResource<D> {
}

export function InsuranceAgencyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InsuranceAgency & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InsuranceAgencyClass extends FinancialServiceMixin(Resource) {
  }
  return InsuranceAgencyClass as any
}
InsuranceAgencyMixin.appliesTo = schema.InsuranceAgency
InsuranceAgencyMixin.createFactory = (env: RdfineEnvironment) => createFactory<InsuranceAgency>([FinancialServiceMixin, InsuranceAgencyMixin], { types: [schema.InsuranceAgency] }, env)
