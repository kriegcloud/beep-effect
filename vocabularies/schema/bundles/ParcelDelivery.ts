import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DeliveryEventMixin } from '../lib/DeliveryEvent.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrderMixin } from '../lib/Order.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { ParcelDeliveryMixin } from '../lib/ParcelDelivery.js';
import { PersonMixin } from '../lib/Person.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { ProductMixin } from '../lib/Product.js';

export const ParcelDeliveryBundle = [
  DeliveryEventMixin as Mixin,
  IntangibleMixin as Mixin,
  OrderMixin as Mixin,
  OrganizationMixin as Mixin,
  ParcelDeliveryMixin as Mixin,
  PersonMixin as Mixin,
  PostalAddressMixin as Mixin,
  ProductMixin as Mixin];
