import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AchieveActionMixin } from '../lib/AchieveAction.js';
import { TieActionMixin } from '../lib/TieAction.js';

export const TieActionBundle = [
  AchieveActionMixin as Mixin,
  TieActionMixin as Mixin];
