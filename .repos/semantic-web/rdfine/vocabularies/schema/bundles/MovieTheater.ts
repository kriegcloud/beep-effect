import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { EntertainmentBusinessMixin } from '../lib/EntertainmentBusiness.js';
import { MovieTheaterMixin } from '../lib/MovieTheater.js';

export const MovieTheaterBundle = [
  CivicStructureMixin as Mixin,
  EntertainmentBusinessMixin as Mixin,
  MovieTheaterMixin as Mixin];
