import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IntangibleMixin } from '../lib/Intangible.js';
import { ThingMixin } from '../lib/Thing.js';

export const IntangibleBundle = [
  IntangibleMixin as Mixin,
  ThingMixin as Mixin];
