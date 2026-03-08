import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { NoteMixin } from '../lib/Note.js';
import { ObjectMixin } from '../lib/Object.js';

export const NoteBundle = [
  NoteMixin as Mixin,
  ObjectMixin as Mixin];
