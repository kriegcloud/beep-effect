import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { SubmitMixin } from '../lib/Submit.js';

export const SubmitBundle = [
  ActivityMixin as Mixin,
  SubmitMixin as Mixin];
