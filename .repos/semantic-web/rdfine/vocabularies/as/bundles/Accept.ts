import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AcceptMixin } from '../lib/Accept.js';
import { ActivityMixin } from '../lib/Activity.js';

export const AcceptBundle = [
  AcceptMixin as Mixin,
  ActivityMixin as Mixin];
