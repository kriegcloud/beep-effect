import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialServiceMixin } from './FinancialService.js';

export interface AccountingService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialService<D>, rdfine.RdfResource<D> {
}

export function AccountingServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AccountingService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AccountingServiceClass extends FinancialServiceMixin(Resource) {
  }
  return AccountingServiceClass as any
}
AccountingServiceMixin.appliesTo = schema.AccountingService
AccountingServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<AccountingService>([FinancialServiceMixin, AccountingServiceMixin], { types: [schema.AccountingService] }, env)
