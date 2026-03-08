import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GroupMixin } from '../lib/Group.js';
import { ObjectMixin } from '../lib/Object.js';

export const GroupBundle = [
  GroupMixin as Mixin,
  ObjectMixin as Mixin];
