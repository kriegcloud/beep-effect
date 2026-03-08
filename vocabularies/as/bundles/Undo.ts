import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActivityMixin } from '../lib/Activity.js';
import { UndoMixin } from '../lib/Undo.js';

export const UndoBundle = [
  ActivityMixin as Mixin,
  UndoMixin as Mixin];
