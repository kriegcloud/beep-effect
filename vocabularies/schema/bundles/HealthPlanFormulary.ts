import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthPlanFormularyMixin } from '../lib/HealthPlanFormulary.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const HealthPlanFormularyBundle = [
  HealthPlanFormularyMixin as Mixin,
  IntangibleMixin as Mixin];
