import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmployeeRoleMixin } from '../lib/EmployeeRole.js';
import { MonetaryAmountMixin } from '../lib/MonetaryAmount.js';
import { OrganizationRoleMixin } from '../lib/OrganizationRole.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';

export const EmployeeRoleBundle = [
  EmployeeRoleMixin as Mixin,
  MonetaryAmountMixin as Mixin,
  OrganizationRoleMixin as Mixin,
  PriceSpecificationMixin as Mixin];
