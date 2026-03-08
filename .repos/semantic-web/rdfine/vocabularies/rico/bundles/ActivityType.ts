import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { ActivityTypeMixin } from '../lib/ActivityType.js';
import { TypeMixin } from '../lib/Type.js';

export const ActivityTypeBundle = [
  ActivityMixin as Mixin,
  ActivityTypeMixin as Mixin,
  TypeMixin as Mixin];
