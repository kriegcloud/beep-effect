import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { LinkMixin } from '../lib/Link.js';
import { ObjectMixin } from '../lib/Object.js';

export const ActivityBundle = [
  ActivityMixin as Mixin,
  LinkMixin as Mixin,
  ObjectMixin as Mixin];
