import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AllocateActionMixin } from '../lib/AllocateAction.js';
import { RejectActionMixin } from '../lib/RejectAction.js';

export const RejectActionBundle = [
  AllocateActionMixin as Mixin,
  RejectActionMixin as Mixin];
