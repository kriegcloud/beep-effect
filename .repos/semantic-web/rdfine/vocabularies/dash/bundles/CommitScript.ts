import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommitScriptMixin } from '../lib/CommitScript.js';
import { ScriptMixin } from '../lib/Script.js';

export const CommitScriptBundle = [
  CommitScriptMixin as Mixin,
  ScriptMixin as Mixin];
