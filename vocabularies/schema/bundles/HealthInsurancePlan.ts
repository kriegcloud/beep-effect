import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ContactPointMixin } from '../lib/ContactPoint.js';
import { HealthInsurancePlanMixin } from '../lib/HealthInsurancePlan.js';
import { HealthPlanFormularyMixin } from '../lib/HealthPlanFormulary.js';
import { HealthPlanNetworkMixin } from '../lib/HealthPlanNetwork.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const HealthInsurancePlanBundle = [
  ContactPointMixin as Mixin,
  HealthInsurancePlanMixin as Mixin,
  HealthPlanFormularyMixin as Mixin,
  HealthPlanNetworkMixin as Mixin,
  IntangibleMixin as Mixin];
