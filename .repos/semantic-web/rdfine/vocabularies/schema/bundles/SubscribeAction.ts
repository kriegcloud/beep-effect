import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { SubscribeActionMixin } from '../lib/SubscribeAction.js';

export const SubscribeActionBundle = [
  InteractActionMixin as Mixin,
  SubscribeActionMixin as Mixin];
