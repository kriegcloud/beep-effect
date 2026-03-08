import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { MarryActionMixin } from '../lib/MarryAction.js';

export const MarryActionBundle = [
  InteractActionMixin as Mixin,
  MarryActionMixin as Mixin];
