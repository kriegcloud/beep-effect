import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DurationMixin } from '../lib/Duration.js';
import { HowToDirectionMixin } from '../lib/HowToDirection.js';
import { HowToSupplyMixin } from '../lib/HowToSupply.js';
import { HowToToolMixin } from '../lib/HowToTool.js';
import { ListItemMixin } from '../lib/ListItem.js';
import { MediaObjectMixin } from '../lib/MediaObject.js';

export const HowToDirectionBundle = [
  CreativeWorkMixin as Mixin,
  DurationMixin as Mixin,
  HowToDirectionMixin as Mixin,
  HowToSupplyMixin as Mixin,
  HowToToolMixin as Mixin,
  ListItemMixin as Mixin,
  MediaObjectMixin as Mixin];
