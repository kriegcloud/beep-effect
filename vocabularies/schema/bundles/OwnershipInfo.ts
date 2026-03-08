import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { OrganizationMixin } from '../lib/Organization.js';
import { OwnershipInfoMixin } from '../lib/OwnershipInfo.js';
import { PersonMixin } from '../lib/Person.js';
import { ProductMixin } from '../lib/Product.js';
import { ServiceMixin } from '../lib/Service.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const OwnershipInfoBundle = [
  OrganizationMixin as Mixin,
  OwnershipInfoMixin as Mixin,
  PersonMixin as Mixin,
  ProductMixin as Mixin,
  ServiceMixin as Mixin,
  StructuredValueMixin as Mixin];
