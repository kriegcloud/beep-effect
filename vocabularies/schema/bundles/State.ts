import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AdministrativeAreaMixin } from '../lib/AdministrativeArea.js';
import { StateMixin } from '../lib/State.js';

export const StateBundle = [
  AdministrativeAreaMixin as Mixin,
  StateMixin as Mixin];
