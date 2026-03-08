import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { InteractActionMixin } from '../lib/InteractAction.js';
import { LeaveActionMixin } from '../lib/LeaveAction.js';

export const LeaveActionBundle = [
  EventMixin as Mixin,
  InteractActionMixin as Mixin,
  LeaveActionMixin as Mixin];
