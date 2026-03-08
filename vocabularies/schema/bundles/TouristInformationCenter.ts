import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { TouristInformationCenterMixin } from '../lib/TouristInformationCenter.js';

export const TouristInformationCenterBundle = [
  LocalBusinessMixin as Mixin,
  TouristInformationCenterMixin as Mixin];
