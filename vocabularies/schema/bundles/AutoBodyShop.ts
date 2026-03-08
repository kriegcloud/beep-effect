import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutoBodyShopMixin } from '../lib/AutoBodyShop.js';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';

export const AutoBodyShopBundle = [
  AutoBodyShopMixin as Mixin,
  AutomotiveBusinessMixin as Mixin];
