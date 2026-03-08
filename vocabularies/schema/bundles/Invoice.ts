import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { DurationMixin } from '../lib/Duration.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { InvoiceMixin } from '../lib/Invoice.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { OrderMixin } from '../lib/Order.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';
import { ThingMixin } from '../lib/Thing.js';

export const InvoiceBundle = [
  CategoryCodeMixin as Mixin,
  DurationMixin as Mixin,
  IntangibleMixin as Mixin,
  InvoiceMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  OrderMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  PriceSpecificationMixin as Mixin,
  ThingMixin as Mixin];
