import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { LeaveMixin } from '../lib/Leave.js';

export const LeaveBundle = [
  ActivityMixin as Mixin,
  LeaveMixin as Mixin];
