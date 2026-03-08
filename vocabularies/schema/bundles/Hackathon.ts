import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EventMixin } from '../lib/Event.js';
import { HackathonMixin } from '../lib/Hackathon.js';

export const HackathonBundle = [
  EventMixin as Mixin,
  HackathonMixin as Mixin];
