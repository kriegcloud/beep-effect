import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { LearningResourceMixin } from '../lib/LearningResource.js';
import { QuizMixin } from '../lib/Quiz.js';

export const QuizBundle = [
  LearningResourceMixin as Mixin,
  QuizMixin as Mixin];
