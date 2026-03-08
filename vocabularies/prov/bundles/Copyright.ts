import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { CopyrightMixin } from '../lib/Copyright.js';

export const CopyrightBundle = [
  ActivityMixin as Mixin,
  CopyrightMixin as Mixin];
