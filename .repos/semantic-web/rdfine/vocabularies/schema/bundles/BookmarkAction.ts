import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BookmarkActionMixin } from '../lib/BookmarkAction.js';
import { OrganizeActionMixin } from '../lib/OrganizeAction.js';

export const BookmarkActionBundle = [
  BookmarkActionMixin as Mixin,
  OrganizeActionMixin as Mixin];
