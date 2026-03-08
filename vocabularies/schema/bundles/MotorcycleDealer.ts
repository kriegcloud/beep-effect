import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { MotorcycleDealerMixin } from '../lib/MotorcycleDealer.js';

export const MotorcycleDealerBundle = [
  AutomotiveBusinessMixin as Mixin,
  MotorcycleDealerMixin as Mixin];
