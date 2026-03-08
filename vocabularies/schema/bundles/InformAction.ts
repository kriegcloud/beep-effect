import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommunicateActionMixin } from '../lib/CommunicateAction.js';
import { EventMixin } from '../lib/Event.js';
import { InformActionMixin } from '../lib/InformAction.js';

export const InformActionBundle = [
  CommunicateActionMixin as Mixin,
  EventMixin as Mixin,
  InformActionMixin as Mixin];
