import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EntryPointMixin } from '../lib/EntryPoint.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';

export const EntryPointBundle = [
  EntryPointMixin as Mixin,
  IntangibleMixin as Mixin,
  SoftwareApplicationMixin as Mixin];
