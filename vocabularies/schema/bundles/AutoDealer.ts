import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutoDealerMixin } from '../lib/AutoDealer.js';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';

export const AutoDealerBundle = [
  AutoDealerMixin as Mixin,
  AutomotiveBusinessMixin as Mixin];
