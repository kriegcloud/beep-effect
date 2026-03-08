import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { HotelMixin } from '../lib/Hotel.js';
import { LodgingBusinessMixin } from '../lib/LodgingBusiness.js';

export const HotelBundle = [
  HotelMixin as Mixin,
  LodgingBusinessMixin as Mixin];
