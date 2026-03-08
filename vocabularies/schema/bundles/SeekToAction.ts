import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { HyperTocEntryMixin } from '../lib/HyperTocEntry.js';
import { SeekToActionMixin } from '../lib/SeekToAction.js';

export const SeekToActionBundle = [
  ActionMixin as Mixin,
  HyperTocEntryMixin as Mixin,
  SeekToActionMixin as Mixin];
