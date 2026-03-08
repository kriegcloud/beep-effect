import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { InteractActionMixin } from '../lib/InteractAction.js';

export const InteractActionBundle = [
  ActionMixin as Mixin,
  InteractActionMixin as Mixin];
