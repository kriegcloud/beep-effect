import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialProductMixin } from './FinancialProduct.js';

export interface InvestmentOrDeposit<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialProduct<D>, rdfine.RdfResource<D> {
  amount: Schema.MonetaryAmount<D> | undefined;
  amountLiteral: number | undefined;
}

export function InvestmentOrDepositMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InvestmentOrDeposit & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InvestmentOrDepositClass extends FinancialProductMixin(Resource) {
    @rdfine.property.resource()
    amount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.amount, type: Number })
    amountLiteral: number | undefined;
  }
  return InvestmentOrDepositClass as any
}
InvestmentOrDepositMixin.appliesTo = schema.InvestmentOrDeposit
InvestmentOrDepositMixin.createFactory = (env: RdfineEnvironment) => createFactory<InvestmentOrDeposit>([FinancialProductMixin, InvestmentOrDepositMixin], { types: [schema.InvestmentOrDeposit] }, env)
