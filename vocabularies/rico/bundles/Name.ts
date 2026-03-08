import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AppellationMixin } from '../lib/Appellation.js';
import { NameMixin } from '../lib/Name.js';
import { ThingMixin } from '../lib/Thing.js';

export const NameBundle = [
  AppellationMixin as Mixin,
  NameMixin as Mixin,
  ThingMixin as Mixin];
