import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AchieveActionMixin } from '../lib/AchieveAction.js';
import { ActionMixin } from '../lib/Action.js';

export const AchieveActionBundle = [
  AchieveActionMixin as Mixin,
  ActionMixin as Mixin];
