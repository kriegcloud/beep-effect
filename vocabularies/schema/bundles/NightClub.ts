import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';
import { NightClubMixin } from '../lib/NightClub.js';

export const NightClubBundle = [
  EntertainmentBusinessMixin as Mixin,
  NightClubMixin as Mixin];
