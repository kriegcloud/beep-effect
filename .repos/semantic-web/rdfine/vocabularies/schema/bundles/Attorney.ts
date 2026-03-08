import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AttorneyMixin } from '../lib/Attorney.js';
import { LegalServiceMixin } from '../lib/LegalService.js';

export const AttorneyBundle = [
  AttorneyMixin as Mixin,
  LegalServiceMixin as Mixin];
