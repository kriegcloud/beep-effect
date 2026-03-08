import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthPlanCostSharingSpecificationMixin } from '../lib/HealthPlanCostSharingSpecification.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { PriceSpecificationMixin } from '../lib/PriceSpecification.js';

export const HealthPlanCostSharingSpecificationBundle = [
  HealthPlanCostSharingSpecificationMixin as Mixin,
  IntangibleMixin as Mixin,
  PriceSpecificationMixin as Mixin];
