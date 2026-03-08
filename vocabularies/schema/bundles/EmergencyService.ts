import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EmergencyServiceMixin } from '../lib/EmergencyService.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const EmergencyServiceBundle = [
  EmergencyServiceMixin as Mixin,
  LocalBusinessMixin as Mixin];
