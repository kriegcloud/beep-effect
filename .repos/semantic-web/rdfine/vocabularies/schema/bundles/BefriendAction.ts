import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BefriendActionMixin } from '../lib/BefriendAction.js';
import { InteractActionMixin } from '../lib/InteractAction.js';

export const BefriendActionBundle = [
  BefriendActionMixin as Mixin,
  InteractActionMixin as Mixin];
