import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { ControlActionMixin } from '../lib/ControlAction.js';

export const ControlActionBundle = [
  ActionMixin as Mixin,
  ControlActionMixin as Mixin];
