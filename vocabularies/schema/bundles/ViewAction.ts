import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ConsumeActionMixin } from '../lib/ConsumeAction.js';
import { ViewActionMixin } from '../lib/ViewAction.js';

export const ViewActionBundle = [
  ConsumeActionMixin as Mixin,
  ViewActionMixin as Mixin];
