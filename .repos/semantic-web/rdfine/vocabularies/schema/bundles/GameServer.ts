import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { GameServerMixin } from '../lib/GameServer.js';
import { IntangibleMixin } from '../lib/Intangible.js';
import { VideoGameMixin } from '../lib/VideoGame.js';

export const GameServerBundle = [
  GameServerMixin as Mixin,
  IntangibleMixin as Mixin,
  VideoGameMixin as Mixin];
