import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChooseActionMixin } from '../lib/ChooseAction.js';
import { PersonMixin } from '../lib/Person.js';
import { VoteActionMixin } from '../lib/VoteAction.js';

export const VoteActionBundle = [
  ChooseActionMixin as Mixin,
  PersonMixin as Mixin,
  VoteActionMixin as Mixin];
