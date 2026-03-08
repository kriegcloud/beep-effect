import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HealthAndBeautyBusinessMixin } from '../lib/HealthAndBeautyBusiness.js';
import { HealthClubMixin } from '../lib/HealthClub.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const HealthClubBundle = [
  HealthAndBeautyBusinessMixin as Mixin,
  HealthClubMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
