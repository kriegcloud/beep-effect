import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Order<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  acceptedOffer: Schema.Offer<D> | undefined;
  billingAddress: Schema.PostalAddress<D> | undefined;
  broker: Schema.Organization<D> | Schema.Person<D> | undefined;
  confirmationNumber: string | undefined;
  customer: Schema.Organization<D> | Schema.Person<D> | undefined;
  discount: number | string | undefined;
  discountCode: string | undefined;
  discountCurrency: string | undefined;
  isGift: boolean | undefined;
  merchant: Schema.Organization<D> | Schema.Person<D> | undefined;
  orderDate: Date | undefined;
  orderDelivery: Schema.ParcelDelivery<D> | undefined;
  orderedItem: Schema.OrderItem<D> | Schema.Product<D> | Schema.Service<D> | undefined;
  orderNumber: string | undefined;
  orderStatus: Schema.OrderStatus | undefined;
  partOfInvoice: Schema.Invoice<D> | undefined;
  paymentDue: Date | undefined;
  paymentDueDate: Date | undefined;
  paymentMethod: Schema.PaymentMethod | undefined;
  paymentMethodId: string | undefined;
  paymentUrl: RDF.NamedNode | undefined;
  seller: Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function OrderMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Order & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OrderClass extends IntangibleMixin(Resource) {
    @rdfine.property.resource()
    acceptedOffer: Schema.Offer | undefined;
    @rdfine.property.resource()
    billingAddress: Schema.PostalAddress | undefined;
    @rdfine.property.resource()
    broker: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    confirmationNumber: string | undefined;
    @rdfine.property.resource()
    customer: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal()
    discount: number | string | undefined;
    @rdfine.property.literal()
    discountCode: string | undefined;
    @rdfine.property.literal()
    discountCurrency: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    isGift: boolean | undefined;
    @rdfine.property.resource()
    merchant: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    orderDate: Date | undefined;
    @rdfine.property.resource()
    orderDelivery: Schema.ParcelDelivery | undefined;
    @rdfine.property.resource()
    orderedItem: Schema.OrderItem | Schema.Product | Schema.Service | undefined;
    @rdfine.property.literal()
    orderNumber: string | undefined;
    @rdfine.property()
    orderStatus: Schema.OrderStatus | undefined;
    @rdfine.property.resource()
    partOfInvoice: Schema.Invoice | undefined;
    @rdfine.property.literal({ type: Date })
    paymentDue: Date | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    paymentDueDate: Date | undefined;
    @rdfine.property()
    paymentMethod: Schema.PaymentMethod | undefined;
    @rdfine.property.literal()
    paymentMethodId: string | undefined;
    @rdfine.property()
    paymentUrl: RDF.NamedNode | undefined;
    @rdfine.property.resource()
    seller: Schema.Organization | Schema.Person | undefined;
  }
  return OrderClass as any
}
OrderMixin.appliesTo = schema.Order
OrderMixin.createFactory = (env: RdfineEnvironment) => createFactory<Order>([IntangibleMixin, OrderMixin], { types: [schema.Order] }, env)
