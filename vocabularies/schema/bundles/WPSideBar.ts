import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { WebPageElementMixin } from '../lib/WebPageElement.js';
import { WPSideBarMixin } from '../lib/WPSideBar.js';

export const WPSideBarBundle = [
  WebPageElementMixin as Mixin,
  WPSideBarMixin as Mixin];
