import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AllocateActionMixin } from '../lib/AllocateAction.js';
import { AssignActionMixin } from '../lib/AssignAction.js';

export const AssignActionBundle = [
  AllocateActionMixin as Mixin,
  AssignActionMixin as Mixin];
