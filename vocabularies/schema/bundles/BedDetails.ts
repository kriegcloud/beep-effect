import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BedDetailsMixin } from '../lib/BedDetails.js';
import { IntangibleMixin } from '../lib/Intangible.js';

export const BedDetailsBundle = [
  BedDetailsMixin as Mixin,
  IntangibleMixin as Mixin];
