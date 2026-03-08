import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AccommodationMixin } from '../lib/Accommodation.js';
import { CampingPitchMixin } from '../lib/CampingPitch.js';

export const CampingPitchBundle = [
  AccommodationMixin as Mixin,
  CampingPitchMixin as Mixin];
