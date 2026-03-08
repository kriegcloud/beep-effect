import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface FinancialService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
  feesAndCommissionsSpecification: string | undefined;
  feesAndCommissionsSpecificationTerm: RDF.NamedNode | undefined;
}

export function FinancialServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FinancialService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FinancialServiceClass extends LocalBusinessMixin(Resource) {
    @rdfine.property.literal()
    feesAndCommissionsSpecification: string | undefined;
    @rdfine.property({ path: schema.feesAndCommissionsSpecification })
    feesAndCommissionsSpecificationTerm: RDF.NamedNode | undefined;
  }
  return FinancialServiceClass as any
}
FinancialServiceMixin.appliesTo = schema.FinancialService
FinancialServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<FinancialService>([LocalBusinessMixin, FinancialServiceMixin], { types: [schema.FinancialService] }, env)
