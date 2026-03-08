import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { AudienceMixin } from '../lib/Audience.js';
import { EventMixin } from '../lib/Event.js';
import { PlayActionMixin } from '../lib/PlayAction.js';

export const PlayActionBundle = [
  ActionMixin as Mixin,
  AudienceMixin as Mixin,
  EventMixin as Mixin,
  PlayActionMixin as Mixin];
