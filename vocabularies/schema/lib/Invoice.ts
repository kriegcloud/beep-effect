import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Invoice<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  accountId: string | undefined;
  billingPeriod: Schema.Duration<D> | undefined;
  broker: Schema.Organization<D> | Schema.Person<D> | undefined;
  category: Schema.CategoryCode<D> | Schema.Thing<D> | undefined;
  categoryLiteral: string | undefined;
  confirmationNumber: string | undefined;
  customer: Schema.Organization<D> | Schema.Person<D> | undefined;
  minimumPaymentDue: Schema.MonetaryAmount<D> | Schema.PriceSpecification<D> | undefined;
  paymentDue: Date | undefined;
  paymentDueDate: Date | undefined;
  paymentMethod: Schema.PaymentMethod | undefined;
  paymentMethodId: string | undefined;
  paymentStatus: string | undefined;
  paymentStatusTerm: Schema.PaymentStatusType | undefined;
  provider: Schema.Organization<D> | Schema.Person<D> | undefined;
  referencesOrder: Schema.Order<D> | undefined;
  scheduledPaymentDate: Date | undefined;
  totalPaymentDue: Schema.MonetaryAmount<D> | Schema.PriceSpecification<D> | undefined;
}

export function InvoiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Invoice & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InvoiceClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    accountId: string | undefined;
    @rdfine.property.resource()
    billingPeriod: Schema.Duration | undefined;
    @rdfine.property.resource()
    broker: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    category: Schema.CategoryCode | Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.category })
    categoryLiteral: string | undefined;
    @rdfine.property.literal()
    confirmationNumber: string | undefined;
    @rdfine.property.resource()
    customer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    minimumPaymentDue: Schema.MonetaryAmount | Schema.PriceSpecification | undefined;
    @rdfine.property.literal({ type: Date })
    paymentDue: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    paymentDueDate: Date | undefined;
    @rdfine.property()
    paymentMethod: Schema.PaymentMethod | undefined;
    @rdfine.property.literal()
    paymentMethodId: string | undefined;
    @rdfine.property.literal()
    paymentStatus: string | undefined;
    @rdfine.property({ path: schema.paymentStatus })
    paymentStatusTerm: Schema.PaymentStatusType | undefined;
    @rdfine.property.resource()
    provider: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    referencesOrder: Schema.Order | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    scheduledPaymentDate: Date | undefined;
    @rdfine.property.resource()
    totalPaymentDue: Schema.MonetaryAmount | Schema.PriceSpecification | undefined;
  }
  return InvoiceClass as any
}
InvoiceMixin.appliesTo = schema.Invoice
InvoiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Invoice>([IntangibleMixin, InvoiceMixin], { types: [schema.Invoice] }, env)
