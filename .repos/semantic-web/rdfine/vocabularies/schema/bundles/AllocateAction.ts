import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AllocateActionMixin } from '../lib/AllocateAction.js';
import { OrganizeActionMixin } from '../lib/OrganizeAction.js';

export const AllocateActionBundle = [
  AllocateActionMixin as Mixin,
  OrganizeActionMixin as Mixin];
