import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CategoryCodeMixin } from '../lib/CategoryCode.js';
import { CivicStructureMixin } from '../lib/CivicStructure.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DataFeedMixin } from '../lib/DataFeed.js';
import { DatasetMixin } from '../lib/Dataset.js';
import { GovernmentServiceMixin } from '../lib/GovernmentService.js';
import { LocalBusinessMixin } from '../lib/LocalBusiness.js';
import { ObservationMixin } from '../lib/Observation.js';
import { SpecialAnnouncementMixin } from '../lib/SpecialAnnouncement.js';
import { ThingMixin } from '../lib/Thing.js';
import { WebContentMixin } from '../lib/WebContent.js';

export const SpecialAnnouncementBundle = [
  CategoryCodeMixin as Mixin,
  CivicStructureMixin as Mixin,
  CreativeWorkMixin as Mixin,
  DataFeedMixin as Mixin,
  DatasetMixin as Mixin,
  GovernmentServiceMixin as Mixin,
  LocalBusinessMixin as Mixin,
  ObservationMixin as Mixin,
  SpecialAnnouncementMixin as Mixin,
  ThingMixin as Mixin,
  WebContentMixin as Mixin];
