import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { AutoRentalMixin } from '../lib/AutoRental.js';

export const AutoRentalBundle = [
  AutomotiveBusinessMixin as Mixin,
  AutoRentalMixin as Mixin];
