import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { APIReferenceMixin } from '../lib/APIReference.js';
import { TechArticleMixin } from '../lib/TechArticle.js';

export const APIReferenceBundle = [
  APIReferenceMixin as Mixin,
  TechArticleMixin as Mixin];
