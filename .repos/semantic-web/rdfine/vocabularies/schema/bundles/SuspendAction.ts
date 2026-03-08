import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ControlActionMixin } from '../lib/ControlAction.js';
import { SuspendActionMixin } from '../lib/SuspendAction.js';

export const SuspendActionBundle = [
  ControlActionMixin as Mixin,
  SuspendActionMixin as Mixin];
