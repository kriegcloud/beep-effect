import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface FinancialProduct<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
  annualPercentageRate: Schema.QuantitativeValue<D> | undefined;
  annualPercentageRateLiteral: number | undefined;
  feesAndCommissionsSpecification: string | undefined;
  feesAndCommissionsSpecificationTerm: RDF.NamedNode | undefined;
  interestRate: Schema.QuantitativeValue<D> | undefined;
  interestRateLiteral: number | undefined;
}

export function FinancialProductMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<FinancialProduct & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class FinancialProductClass extends ServiceMixin(Resource) {
    @rdfine.property.resource()
    annualPercentageRate: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.annualPercentageRate, type: Number })
    annualPercentageRateLiteral: number | undefined;
    @rdfine.property.literal()
    feesAndCommissionsSpecification: string | undefined;
    @rdfine.property({ path: schema.feesAndCommissionsSpecification })
    feesAndCommissionsSpecificationTerm: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    interestRate: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.interestRate, type: Number })
    interestRateLiteral: number | undefined;
  }
  return FinancialProductClass as any
}
FinancialProductMixin.appliesTo = schema.FinancialProduct
FinancialProductMixin.createFactory = (env: RdfineEnvironment) => createFactory<FinancialProduct>([ServiceMixin, FinancialProductMixin], { types: [schema.FinancialProduct] }, env)
