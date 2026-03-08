import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AchieveActionMixin } from '../lib/AchieveAction.js';
import { LoseActionMixin } from '../lib/LoseAction.js';
import { PersonMixin } from '../lib/Person.js';

export const LoseActionBundle = [
  AchieveActionMixin as Mixin,
  LoseActionMixin as Mixin,
  PersonMixin as Mixin];
