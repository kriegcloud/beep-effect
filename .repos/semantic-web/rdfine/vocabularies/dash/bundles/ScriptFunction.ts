import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptFunctionMixin } from '../lib/ScriptFunction.js';
import { ScriptMixin } from '../lib/Script.js';

export const ScriptFunctionBundle = [
  ScriptFunctionMixin as Mixin,
  ScriptMixin as Mixin];
