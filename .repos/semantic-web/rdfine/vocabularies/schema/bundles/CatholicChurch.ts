import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CatholicChurchMixin } from '../lib/CatholicChurch.js';
import { ChurchMixin } from '../lib/Church.js';

export const CatholicChurchBundle = [
  CatholicChurchMixin as Mixin,
  ChurchMixin as Mixin];
