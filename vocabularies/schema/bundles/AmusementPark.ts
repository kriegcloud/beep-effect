import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AmusementParkMixin } from '../lib/AmusementPark.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';

export const AmusementParkBundle = [
  AmusementParkMixin as Mixin,
  EntertainmentBusinessMixin as Mixin];
