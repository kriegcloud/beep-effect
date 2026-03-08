import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { InstallActionMixin } from '../lib/InstallAction.js';

export const InstallActionBundle = [
  ConsumeActionMixin as Mixin,
  InstallActionMixin as Mixin];
