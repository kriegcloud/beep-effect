import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionGroupMixin } from '../lib/ActionGroup.js';
import { ActionMixin } from '../lib/Action.js';
import { ScriptMixin } from '../lib/Script.js';

export const ActionBundle = [
  ActionGroupMixin as Mixin,
  ActionMixin as Mixin,
  ScriptMixin as Mixin];
