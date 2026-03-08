import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CodeMixin } from '../lib/Code.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const CodeBundle = [
  CodeMixin as Mixin,
  CreativeWorkMixin as Mixin];
