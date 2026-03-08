import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { FinancialProductMixin } from './FinancialProduct.js';

export interface PaymentService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.FinancialProduct<D>, rdfine.RdfResource<D> {
}

export function PaymentServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PaymentService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PaymentServiceClass extends FinancialProductMixin(Resource) {
  }
  return PaymentServiceClass as any
}
PaymentServiceMixin.appliesTo = schema.PaymentService
PaymentServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<PaymentService>([FinancialProductMixin, PaymentServiceMixin], { types: [schema.PaymentService] }, env)
