import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AnatomicalStructureMixin } from '../lib/AnatomicalStructure.js';
import { ArteryMixin } from '../lib/Artery.js';
import { VesselMixin } from '../lib/Vessel.js';

export const ArteryBundle = [
  AnatomicalStructureMixin as Mixin,
  ArteryMixin as Mixin,
  VesselMixin as Mixin];
