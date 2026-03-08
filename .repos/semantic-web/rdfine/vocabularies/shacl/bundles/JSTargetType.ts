import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { JSExecutableMixin } from '../lib/JSExecutable.js';
import { JSTargetTypeMixin } from '../lib/JSTargetType.js';
import { TargetTypeMixin } from '../lib/TargetType.js';

export const JSTargetTypeBundle = [
  JSExecutableMixin as Mixin,
  JSTargetTypeMixin as Mixin,
  TargetTypeMixin as Mixin];
