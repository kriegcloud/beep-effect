import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EditorMixin } from '../lib/Editor.js';
import { WidgetMixin } from '../lib/Widget.js';

export const EditorBundle = [
  EditorMixin as Mixin,
  WidgetMixin as Mixin];
