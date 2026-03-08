import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { SchoolDistrictMixin } from '../lib/SchoolDistrict.js';

export const SchoolDistrictBundle = [
  AdministrativeAreaMixin as Mixin,
  SchoolDistrictMixin as Mixin];
