import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivateActionMixin } from '../lib/ActivateAction.js';
import { ControlActionMixin } from '../lib/ControlAction.js';

export const ActivateActionBundle = [
  ActivateActionMixin as Mixin,
  ControlActionMixin as Mixin];
