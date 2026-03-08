import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';
import { SportsClubMixin } from '../lib/SportsClub.js';

export const SportsClubBundle = [
  SportsActivityLocationMixin as Mixin,
  SportsClubMixin as Mixin];
