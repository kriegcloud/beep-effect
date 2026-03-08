import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { CountryMixin } from '../lib/Country.js';

export const CountryBundle = [
  AdministrativeAreaMixin as Mixin,
  CountryMixin as Mixin];
