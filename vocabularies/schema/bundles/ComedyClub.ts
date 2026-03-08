import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ComedyClubMixin } from '../lib/ComedyClub.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';

export const ComedyClubBundle = [
  ComedyClubMixin as Mixin,
  EntertainmentBusinessMixin as Mixin];
