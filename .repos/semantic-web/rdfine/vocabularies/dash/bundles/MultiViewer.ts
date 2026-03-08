import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { MultiViewerMixin } from '../lib/MultiViewer.js';
import { ViewerMixin } from '../lib/Viewer.js';

export const MultiViewerBundle = [
  MultiViewerMixin as Mixin,
  ViewerMixin as Mixin];
