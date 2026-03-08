import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { IncludedScriptMixin } from '../lib/IncludedScript.js';
import { ScriptMixin } from '../lib/Script.js';

export const IncludedScriptBundle = [
  IncludedScriptMixin as Mixin,
  ScriptMixin as Mixin];
