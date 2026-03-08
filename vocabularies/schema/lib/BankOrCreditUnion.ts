import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialServiceMixin } from './FinancialService.js';

export interface BankOrCreditUnion<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialService<D>, rdfine.RdfResource<D> {
}

export function BankOrCreditUnionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BankOrCreditUnion & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BankOrCreditUnionClass extends FinancialServiceMixin(Resource) {
  }
  return BankOrCreditUnionClass as any
}
BankOrCreditUnionMixin.appliesTo = schema.BankOrCreditUnion
BankOrCreditUnionMixin.createFactory = (env: RdfineEnvironment) => createFactory<BankOrCreditUnion>([FinancialServiceMixin, BankOrCreditUnionMixin], { types: [schema.BankOrCreditUnion] }, env)
