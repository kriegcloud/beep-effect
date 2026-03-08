import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InvestmentOrDepositMixin } from './InvestmentOrDeposit.js';

export interface InvestmentFund<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InvestmentOrDeposit<D>, rdfine.RdfResource<D> {
}

export function InvestmentFundMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InvestmentFund & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InvestmentFundClass extends InvestmentOrDepositMixin(Resource) {
  }
  return InvestmentFundClass as any
}
InvestmentFundMixin.appliesTo = schema.InvestmentFund
InvestmentFundMixin.createFactory = (env: RdfineEnvironment) => createFactory<InvestmentFund>([InvestmentOrDepositMixin, InvestmentFundMixin], { types: [schema.InvestmentFund] }, env)
