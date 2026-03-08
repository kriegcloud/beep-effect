import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { PlaceMixin } from '../lib/Place.js';

export const AdministrativeAreaBundle = [
  AdministrativeAreaMixin as Mixin,
  PlaceMixin as Mixin];
