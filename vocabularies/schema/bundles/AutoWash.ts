import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AutomotiveBusinessMixin } from '../lib/AutomotiveBusiness.js';
import { AutoWashMixin } from '../lib/AutoWash.js';

export const AutoWashBundle = [
  AutomotiveBusinessMixin as Mixin,
  AutoWashMixin as Mixin];
