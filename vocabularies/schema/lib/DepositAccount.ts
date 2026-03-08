import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BankAccountMixin } from './BankAccount.js';
import { InvestmentOrDepositMixin } from './InvestmentOrDeposit.js';

export interface DepositAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BankAccount<D>, Schema.InvestmentOrDeposit<D>, rdfine.RdfResource<D> {
}

export function DepositAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DepositAccount & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DepositAccountClass extends InvestmentOrDepositMixin(BankAccountMixin(Resource)) {
  }
  return DepositAccountClass as any
}
DepositAccountMixin.appliesTo = schema.DepositAccount
DepositAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<DepositAccount>([InvestmentOrDepositMixin, BankAccountMixin, DepositAccountMixin], { types: [schema.DepositAccount] }, env)
