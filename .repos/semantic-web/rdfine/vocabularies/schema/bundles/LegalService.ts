import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LegalServiceMixin } from '../lib/LegalService.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';

export const LegalServiceBundle = [
  LegalServiceMixin as Mixin,
  LocalBusinessMixin as Mixin];
