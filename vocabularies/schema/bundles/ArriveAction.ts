import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ArriveActionMixin } from '../lib/ArriveAction.js';
import { MoveActionMixin } from '../lib/MoveAction.js';

export const ArriveActionBundle = [
  ArriveActionMixin as Mixin,
  MoveActionMixin as Mixin];
