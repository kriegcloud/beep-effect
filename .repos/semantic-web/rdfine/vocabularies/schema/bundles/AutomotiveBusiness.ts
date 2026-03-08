import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const AutomotiveBusinessBundle = [
  AutomotiveBusinessMixin as Mixin,
  LocalBusinessMixin as Mixin];
