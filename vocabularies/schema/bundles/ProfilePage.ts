import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ProfilePageMixin } from '../lib/ProfilePage.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const ProfilePageBundle = [
  ProfilePageMixin as Mixin,
  WebPageMixin as Mixin];
