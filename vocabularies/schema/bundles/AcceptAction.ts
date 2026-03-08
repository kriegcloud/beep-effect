import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AcceptActionMixin } from '../lib/AcceptAction.js';
import { AllocateActionMixin } from '../lib/AllocateAction.js';

export const AcceptActionBundle = [
  AcceptActionMixin as Mixin,
  AllocateActionMixin as Mixin];
