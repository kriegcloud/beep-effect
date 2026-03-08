import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { GameMixin } from '../lib/Game.js';
import { PlaceMixin } from '../lib/Place.js';
import { PostalAddressMixin } from '../lib/PostalAddress.js';
import { QuantitativeValueMixin } from '../lib/QuantitativeValue.js';
import { ThingMixin } from '../lib/Thing.js';

export const GameBundle = [
  CreativeWorkMixin as Mixin,
  GameMixin as Mixin,
  PlaceMixin as Mixin,
  PostalAddressMixin as Mixin,
  QuantitativeValueMixin as Mixin,
  ThingMixin as Mixin];
