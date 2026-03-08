import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthPlanNetworkMixin } from '../lib/HealthPlanNetwork.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const HealthPlanNetworkBundle = [
  HealthPlanNetworkMixin as Mixin,
  IntangibleMixin as Mixin];
