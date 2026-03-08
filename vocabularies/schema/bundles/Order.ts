import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { InvoiceMixin } from '../lib/Invoice.js';
import { OfferMixin } from '../lib/Offer.js';
import { OrderItemMixin } from '../lib/OrderItem.js';
import { OrderMixin } from '../lib/Order.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { ParcelDeliveryMixin } from '../lib/ParcelDelivery.js';
import { PersonMixin } from '../lib/Person.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { ProductMixin } from '../lib/Product.js';
import { ServiceMixin } from '../lib/Service.js';

export const OrderBundle = [
  IntangibleMixin as Mixin,
  InvoiceMixin as Mixin,
  OfferMixin as Mixin,
  OrderItemMixin as Mixin,
  OrderMixin as Mixin,
  OrganizationMixin as Mixin,
  ParcelDeliveryMixin as Mixin,
  PersonMixin as Mixin,
  PostalAddressMixin as Mixin,
  ProductMixin as Mixin,
  ServiceMixin as Mixin];
