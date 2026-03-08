import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommentMixin } from '../lib/Comment.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';

export const CommentBundle = [
  CommentMixin as Mixin,
  CreativeWorkMixin as Mixin];
