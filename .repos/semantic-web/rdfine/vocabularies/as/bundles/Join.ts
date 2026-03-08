import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { JoinMixin } from '../lib/Join.js';

export const JoinBundle = [
  ActivityMixin as Mixin,
  JoinMixin as Mixin];
