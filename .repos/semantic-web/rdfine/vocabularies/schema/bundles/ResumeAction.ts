import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ControlActionMixin } from '../lib/ControlAction.js';
import { ResumeActionMixin } from '../lib/ResumeAction.js';

export const ResumeActionBundle = [
  ControlActionMixin as Mixin,
  ResumeActionMixin as Mixin];
