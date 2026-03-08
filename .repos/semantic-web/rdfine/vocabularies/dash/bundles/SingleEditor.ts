import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { EditorMixin } from '../lib/Editor.js';
import { SingleEditorMixin } from '../lib/SingleEditor.js';

export const SingleEditorBundle = [
  EditorMixin as Mixin,
  SingleEditorMixin as Mixin];
