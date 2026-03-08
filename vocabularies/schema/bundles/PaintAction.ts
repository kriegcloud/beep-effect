import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { PaintActionMixin } from '../lib/PaintAction.js';

export const PaintActionBundle = [
  CreateActionMixin as Mixin,
  PaintActionMixin as Mixin];
