import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InvestmentOrDepositMixin } from './InvestmentOrDeposit.js';

export interface BrokerageAccount<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InvestmentOrDeposit<D>, rdfine.RdfResource<D> {
}

export function BrokerageAccountMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BrokerageAccount & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BrokerageAccountClass extends InvestmentOrDepositMixin(Resource) {
  }
  return BrokerageAccountClass as any
}
BrokerageAccountMixin.appliesTo = schema.BrokerageAccount
BrokerageAccountMixin.createFactory = (env: RdfineEnvironment) => createFactory<BrokerageAccount>([InvestmentOrDepositMixin, BrokerageAccountMixin], { types: [schema.BrokerageAccount] }, env)
