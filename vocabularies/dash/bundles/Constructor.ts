import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConstructorMixin } from '../lib/Constructor.js';
import { ScriptMixin } from '../lib/Script.js';

export const ConstructorBundle = [
  ConstructorMixin as Mixin,
  ScriptMixin as Mixin];
