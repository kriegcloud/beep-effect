import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AlignmentObjectMixin } from '../lib/AlignmentObject.js';
import { CourseInstanceMixin } from '../lib/CourseInstance.js';
import { CourseMixin } from '../lib/Course.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { LearningResourceMixin } from '../lib/LearningResource.js';
import { StructuredValueMixin } from '../lib/StructuredValue.js';

export const CourseBundle = [
  AlignmentObjectMixin as Mixin,
  CourseInstanceMixin as Mixin,
  CourseMixin as Mixin,
  CreativeWorkMixin as Mixin,
  LearningResourceMixin as Mixin,
  StructuredValueMixin as Mixin];
