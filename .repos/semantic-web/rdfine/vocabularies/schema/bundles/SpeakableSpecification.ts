import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { SpeakableSpecificationMixin } from '../lib/SpeakableSpecification.js';

export const SpeakableSpecificationBundle = [
  IntangibleMixin as Mixin,
  SpeakableSpecificationMixin as Mixin];
