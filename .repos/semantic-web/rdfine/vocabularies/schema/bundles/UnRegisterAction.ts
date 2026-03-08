import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { UnRegisterActionMixin } from '../lib/UnRegisterAction.js';

export const UnRegisterActionBundle = [
  InteractActionMixin as Mixin,
  UnRegisterActionMixin as Mixin];
