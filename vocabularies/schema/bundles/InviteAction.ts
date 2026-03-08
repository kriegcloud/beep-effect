import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { EventMixin } from '../lib/Event.js';
import { InviteActionMixin } from '../lib/InviteAction.js';

export const InviteActionBundle = [
  CommunicateActionMixin as Mixin,
  EventMixin as Mixin,
  InviteActionMixin as Mixin];
