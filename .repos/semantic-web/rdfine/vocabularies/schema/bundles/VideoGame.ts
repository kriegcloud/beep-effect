import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { GameMixin } from '../lib/Game.js';
import { GameServerMixin } from '../lib/GameServer.js';
import { MusicGroupMixin } from '../lib/MusicGroup.js';
import { PersonMixin } from '../lib/Person.js';
import { SoftwareApplicationMixin } from '../lib/SoftwareApplication.js';
import { ThingMixin } from '../lib/Thing.js';
import { VideoGameMixin } from '../lib/VideoGame.js';
import { VideoObjectMixin } from '../lib/VideoObject.js';

export const VideoGameBundle = [
  CreativeWorkMixin as Mixin,
  GameMixin as Mixin,
  GameServerMixin as Mixin,
  MusicGroupMixin as Mixin,
  PersonMixin as Mixin,
  SoftwareApplicationMixin as Mixin,
  ThingMixin as Mixin,
  VideoGameMixin as Mixin,
  VideoObjectMixin as Mixin];
