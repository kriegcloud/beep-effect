import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ViewerMixin } from '../lib/Viewer.js';
import { WidgetMixin } from '../lib/Widget.js';

export const ViewerBundle = [
  ViewerMixin as Mixin,
  WidgetMixin as Mixin];
