import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnimalShelterMixin } from '../lib/AnimalShelter.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const AnimalShelterBundle = [
  AnimalShelterMixin as Mixin,
  LocalBusinessMixin as Mixin];
