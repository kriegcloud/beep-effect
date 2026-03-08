import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { QuotationMixin } from '../lib/Quotation.js';

export const QuotationBundle = [
  CreativeWorkMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  QuotationMixin as Mixin];
