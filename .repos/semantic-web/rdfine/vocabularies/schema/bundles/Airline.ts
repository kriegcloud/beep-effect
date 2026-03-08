import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AirlineMixin } from '../lib/Airline.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const AirlineBundle = [
  AirlineMixin as Mixin,
  OrganizationMixin as Mixin];
