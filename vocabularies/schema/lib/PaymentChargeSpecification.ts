import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PriceSpecificationMixin } from './PriceSpecification.js';

export interface PaymentChargeSpecification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PriceSpecification<D>, rdfine.RdfResource<D> {
  appliesToDeliveryMethod: Schema.DeliveryMethod | undefined;
  appliesToPaymentMethod: Schema.PaymentMethod | undefined;
}

export function PaymentChargeSpecificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PaymentChargeSpecification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PaymentChargeSpecificationClass extends PriceSpecificationMixin(Resource) {
    @rdfine.property()
    appliesToDeliveryMethod: Schema.DeliveryMethod | undefined;
    @rdfine.property()
    appliesToPaymentMethod: Schema.PaymentMethod | undefined;
  }
  return PaymentChargeSpecificationClass as any
}
PaymentChargeSpecificationMixin.appliesTo = schema.PaymentChargeSpecification
PaymentChargeSpecificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PaymentChargeSpecification>([PriceSpecificationMixin, PaymentChargeSpecificationMixin], { types: [schema.PaymentChargeSpecification] }, env)
