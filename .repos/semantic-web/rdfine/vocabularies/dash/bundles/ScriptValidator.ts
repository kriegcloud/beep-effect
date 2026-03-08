import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptMixin } from '../lib/Script.js';
import { ScriptValidatorMixin } from '../lib/ScriptValidator.js';

export const ScriptValidatorBundle = [
  ScriptMixin as Mixin,
  ScriptValidatorMixin as Mixin];
