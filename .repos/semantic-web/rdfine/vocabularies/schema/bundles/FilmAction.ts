import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreateActionMixin } from '../lib/CreateAction.js';
import { FilmActionMixin } from '../lib/FilmAction.js';

export const FilmActionBundle = [
  CreateActionMixin as Mixin,
  FilmActionMixin as Mixin];
