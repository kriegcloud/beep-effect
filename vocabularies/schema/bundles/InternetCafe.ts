import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InternetCafeMixin } from '../lib/InternetCafe.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const InternetCafeBundle = [
  InternetCafeMixin as Mixin,
  LocalBusinessMixin as Mixin];
