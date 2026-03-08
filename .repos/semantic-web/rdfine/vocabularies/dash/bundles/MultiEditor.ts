import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EditorMixin } from '../lib/Editor.js';
import { MultiEditorMixin } from '../lib/MultiEditor.js';

export const MultiEditorBundle = [
  EditorMixin as Mixin,
  MultiEditorMixin as Mixin];
