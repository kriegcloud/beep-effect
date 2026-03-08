import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptMixin } from '../lib/Script.js';
import { ShapeScriptMixin } from '../lib/ShapeScript.js';

export const ShapeScriptBundle = [
  ScriptMixin as Mixin,
  ShapeScriptMixin as Mixin];
