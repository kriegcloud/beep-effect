import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { EventMixin } from '../lib/Event.js';
import { MusicCompositionMixin } from '../lib/MusicComposition.js';
import { MusicRecordingMixin } from '../lib/MusicRecording.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';

export const MusicCompositionBundle = [
  CreativeWorkMixin as Mixin,
  EventMixin as Mixin,
  MusicCompositionMixin as Mixin,
  MusicRecordingMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin];
