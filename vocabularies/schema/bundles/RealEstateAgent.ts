import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { RealEstateAgentMixin } from '../lib/RealEstateAgent.js';

export const RealEstateAgentBundle = [
  LocalBusinessMixin as Mixin,
  RealEstateAgentMixin as Mixin];
