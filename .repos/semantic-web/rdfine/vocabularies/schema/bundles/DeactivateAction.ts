import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ControlActionMixin } from '../lib/ControlAction.js';
import { DeactivateActionMixin } from '../lib/DeactivateAction.js';

export const DeactivateActionBundle = [
  ControlActionMixin as Mixin,
  DeactivateActionMixin as Mixin];
