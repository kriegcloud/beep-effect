import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ScriptConstraintMixin } from '../lib/ScriptConstraint.js';
import { ScriptMixin } from '../lib/Script.js';

export const ScriptConstraintBundle = [
  ScriptConstraintMixin as Mixin,
  ScriptMixin as Mixin];
