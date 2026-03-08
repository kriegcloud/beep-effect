import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CommentMixin } from '../lib/Comment.js';
import { CorrectionCommentMixin } from '../lib/CorrectionComment.js';

export const CorrectionCommentBundle = [
  CommentMixin as Mixin,
  CorrectionCommentMixin as Mixin];
