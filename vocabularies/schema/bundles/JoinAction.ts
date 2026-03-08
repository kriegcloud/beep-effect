import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { JoinActionMixin } from '../lib/JoinAction.js';

export const JoinActionBundle = [
  EventMixin as Mixin,
  InteractActionMixin as Mixin,
  JoinActionMixin as Mixin];
