import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ApplyActionMixin } from '../lib/ApplyAction.js';
import { OrganizeActionMixin } from '../lib/OrganizeAction.js';

export const ApplyActionBundle = [
  ApplyActionMixin as Mixin,
  OrganizeActionMixin as Mixin];
