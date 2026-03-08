import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { RejectMixin } from '../lib/Reject.js';

export const RejectBundle = [
  ActivityMixin as Mixin,
  RejectMixin as Mixin];
