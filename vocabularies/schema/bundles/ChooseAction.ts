import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AssessActionMixin } from '../lib/AssessAction.js';
import { ChooseActionMixin } from '../lib/ChooseAction.js';
import { ThingMixin } from '../lib/Thing.js';

export const ChooseActionBundle = [
  AssessActionMixin as Mixin,
  ChooseActionMixin as Mixin,
  ThingMixin as Mixin];
