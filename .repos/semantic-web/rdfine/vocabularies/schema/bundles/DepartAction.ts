import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DepartActionMixin } from '../lib/DepartAction.js';
import { MoveActionMixin } from '../lib/MoveAction.js';

export const DepartActionBundle = [
  DepartActionMixin as Mixin,
  MoveActionMixin as Mixin];
