import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GolfCourseMixin } from '../lib/GolfCourse.js';
import { SportsActivityLocationMixin } from '../lib/SportsActivityLocation.js';

export const GolfCourseBundle = [
  GolfCourseMixin as Mixin,
  SportsActivityLocationMixin as Mixin];
