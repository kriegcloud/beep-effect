import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LegalServiceMixin } from '../lib/LegalService.js';
import { NotaryMixin } from '../lib/Notary.js';

export const NotaryBundle = [
  LegalServiceMixin as Mixin,
  NotaryMixin as Mixin];
