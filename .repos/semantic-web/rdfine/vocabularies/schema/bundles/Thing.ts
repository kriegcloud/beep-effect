import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { ActionMixin } from '../lib/Action.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { EventMixin } from '../lib/Event.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { PropertyValueMixin } from '../lib/PropertyValue.js';
import { ThingMixin } from '../lib/Thing.js';

export const ThingBundle = [
  ActionMixin as Mixin,
  CreativeWorkMixin as Mixin,
  EventMixin as Mixin,
  ImageObjectMixin as Mixin,
  PropertyValueMixin as Mixin,
  ThingMixin as Mixin];
