import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CasinoMixin } from '../lib/Casino.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';

export const CasinoBundle = [
  CasinoMixin as Mixin,
  EntertainmentBusinessMixin as Mixin];
