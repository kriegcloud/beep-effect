import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { FamilyMixin } from '../lib/Family.js';
import { FamilyTypeMixin } from '../lib/FamilyType.js';
import { GroupMixin } from '../lib/Group.js';

export const FamilyBundle = [
  FamilyMixin as Mixin,
  FamilyTypeMixin as Mixin,
  GroupMixin as Mixin];
