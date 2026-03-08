import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { ProfessionalServiceMixin } from '../lib/ProfessionalService.js';

export const ProfessionalServiceBundle = [
  LocalBusinessMixin as Mixin,
  ProfessionalServiceMixin as Mixin];
