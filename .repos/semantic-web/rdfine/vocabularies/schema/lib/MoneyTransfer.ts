import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TransferActionMixin } from './TransferAction.js';

export interface MoneyTransfer<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TransferAction<D>, rdfine.RdfResource<D> {
  amount: Schema.MonetaryAmount<D> | undefined;
  amountLiteral: number | undefined;
  beneficiaryBank: Schema.BankOrCreditUnion<D> | undefined;
  beneficiaryBankLiteral: string | undefined;
}

export function MoneyTransferMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MoneyTransfer & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MoneyTransferClass extends TransferActionMixin(Resource) {
    @rdfine.property.resource()
    amount: Schema.MonetaryAmount | undefined;
    @rdfine.property.literal({ path: schema.amount, type: Number })
    amountLiteral: number | undefined;
    @rdfine.property.resource()
    beneficiaryBank: Schema.BankOrCreditUnion | undefined;
    @rdfine.property.literal({ path: schema.beneficiaryBank })
    beneficiaryBankLiteral: string | undefined;
  }
  return MoneyTransferClass as any
}
MoneyTransferMixin.appliesTo = schema.MoneyTransfer
MoneyTransferMixin.createFactory = (env: RdfineEnvironment) => createFactory<MoneyTransfer>([TransferActionMixin, MoneyTransferMixin], { types: [schema.MoneyTransfer] }, env)
