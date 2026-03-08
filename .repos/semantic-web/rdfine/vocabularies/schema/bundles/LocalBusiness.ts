import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PlaceMixin } from '../lib/Place.js';

export const LocalBusinessBundle = [
  LocalBusinessMixin as Mixin,
  OrganizationMixin as Mixin,
  PlaceMixin as Mixin];
