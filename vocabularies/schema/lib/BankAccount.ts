import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialProductMixin } from './FinancialProduct.js';

export interface BankAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialProduct<D>, rdfine.RdfResource<D> {
  accountMinimumInflow: Schema.MonetaryAmount<D> | undefined;
  accountOverdraftLimit: Schema.MonetaryAmount<D> | undefined;
  bankAccountType: string | undefined;
  bankAccountTypeTerm: RDF.NamedNode | undefined;
}

export function BankAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BankAccount & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BankAccountClass extends FinancialProductMixin(Resource) {
    @rdfine.property.resource()
    accountMinimumInflow: Schema.MonetaryAmount | undefined;
    @rdfine.property.resource()
    accountOverdraftLimit: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal()
    bankAccountType: string | undefined;
    @rdfine.property({ path: schema.bankAccountType })
    bankAccountTypeTerm: RDF.NamedNode | undefined;
  }
  return BankAccountClass as any
}
BankAccountMixin.appliesTo = schema.BankAccount
BankAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<BankAccount>([FinancialProductMixin, BankAccountMixin], { types: [schema.BankAccount] }, env)
