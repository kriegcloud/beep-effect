import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { CityMixin } from '../lib/City.js';

export const CityBundle = [
  AdministrativeAreaMixin as Mixin,
  CityMixin as Mixin];
