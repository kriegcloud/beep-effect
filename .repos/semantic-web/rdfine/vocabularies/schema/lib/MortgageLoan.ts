import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LoanOrCreditMixin } from './LoanOrCredit.js';

export interface MortgageLoan<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LoanOrCredit<D>, rdfine.RdfResource<D> {
  domiciledMortgage: boolean | undefined;
  loanMortgageMandateAmount: Schema.MonetaryAmount<D> | undefined;
}

export function MortgageLoanMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MortgageLoan & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MortgageLoanClass extends LoanOrCreditMixin(Resource) {
    @rdfine.property.literal({ type: Boolean })
    domiciledMortgage: boolean | undefined;
    @rdfine.property.resource()
    loanMortgageMandateAmount: Schema.MonetaryAmount | undefined;
  }
  return MortgageLoanClass as any
}
MortgageLoanMixin.appliesTo = schema.MortgageLoan
MortgageLoanMixin.createFactory = (env: RdfineEnvironment) => createFactory<MortgageLoan>([LoanOrCreditMixin, MortgageLoanMixin], { types: [schema.MortgageLoan] }, env)
