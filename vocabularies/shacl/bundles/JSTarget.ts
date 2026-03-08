import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JSExecutableMixin } from '../lib/JSExecutable.js';
import { JSTargetMixin } from '../lib/JSTarget.js';
import { TargetMixin } from '../lib/Target.js';

export const JSTargetBundle = [
  JSExecutableMixin as Mixin,
  JSTargetMixin as Mixin,
  TargetMixin as Mixin];
