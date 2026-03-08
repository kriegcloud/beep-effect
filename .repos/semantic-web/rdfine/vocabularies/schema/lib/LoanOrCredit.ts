import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialProductMixin } from './FinancialProduct.js';

export interface LoanOrCredit<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialProduct<D>, rdfine.RdfResource<D> {
  amount: Schema.MonetaryAmount<D> | undefined;
  amountLiteral: number | undefined;
  currency: string | undefined;
  gracePeriod: Schema.Duration<D> | undefined;
  loanRepaymentForm: Schema.RepaymentSpecification<D> | undefined;
  loanTerm: Schema.QuantitativeValue<D> | undefined;
  loanType: string | undefined;
  loanTypeTerm: RDF.NamedNode | undefined;
  recourseLoan: boolean | undefined;
  renegotiableLoan: boolean | undefined;
  requiredCollateral: Schema.Thing<D> | undefined;
  requiredCollateralLiteral: string | undefined;
}

export function LoanOrCreditMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LoanOrCredit & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LoanOrCreditClass extends FinancialProductMixin(Resource) {
    @rdfine.property.resource()
    amount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.amount, type: Number })
    amountLiteral: number | undefined;
    @rdfine.property.literal()
    currency: string | undefined;
    @rdfine.property.resource()
    gracePeriod: Schema.Duration | undefined;
    @rdfine.property.resource()
    loanRepaymentForm: Schema.RepaymentSpecification | undefined;
    @rdfine.property.resource()
    loanTerm: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal()
    loanType: string | undefined;
    @rdfine.property({ path: schema.loanType })
    loanTypeTerm: RDF.NamedNode | undefined;
    @rdfine.property.literal({ type: Boolean })
    recourseLoan: boolean | undefined;
    @rdfine.property.literal({ type: Boolean })
    renegotiableLoan: boolean | undefined;
    @rdfine.property.resource()
    requiredCollateral: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.requiredCollateral })
    requiredCollateralLiteral: string | undefined;
  }
  return LoanOrCreditClass as any
}
LoanOrCreditMixin.appliesTo = schema.LoanOrCredit
LoanOrCreditMixin.createFactory = (env: RdfineEnvironment) => createFactory<LoanOrCredit>([FinancialProductMixin, LoanOrCreditMixin], { types: [schema.LoanOrCredit] }, env)
