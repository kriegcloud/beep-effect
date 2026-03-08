import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { OrderItemMixin } from '../lib/OrderItem.js';
import { ParcelDeliveryMixin } from '../lib/ParcelDelivery.js';
import { ProductMixin } from '../lib/Product.js';
import { ServiceMixin } from '../lib/Service.js';

export const OrderItemBundle = [
  IntangibleMixin as Mixin,
  OrderItemMixin as Mixin,
  ParcelDeliveryMixin as Mixin,
  ProductMixin as Mixin,
  ServiceMixin as Mixin];
