import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AchieveActionMixin } from '../lib/AchieveAction.js';
import { PersonMixin } from '../lib/Person.js';
import { WinActionMixin } from '../lib/WinAction.js';

export const WinActionBundle = [
  AchieveActionMixin as Mixin,
  PersonMixin as Mixin,
  WinActionMixin as Mixin];
