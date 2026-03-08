import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { SingleViewerMixin } from '../lib/SingleViewer.js';
import { ViewerMixin } from '../lib/Viewer.js';

export const SingleViewerBundle = [
  SingleViewerMixin as Mixin,
  ViewerMixin as Mixin];
