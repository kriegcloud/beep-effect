import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ChangeScriptMixin } from '../lib/ChangeScript.js';
import { ScriptMixin } from '../lib/Script.js';

export const ChangeScriptBundle = [
  ChangeScriptMixin as Mixin,
  ScriptMixin as Mixin];
