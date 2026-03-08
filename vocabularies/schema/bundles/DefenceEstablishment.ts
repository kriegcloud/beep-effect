import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { DefenceEstablishmentMixin } from '../lib/DefenceEstablishment.js';
import { GovernmentBuildingMixin } from '../lib/GovernmentBuilding.js';

export const DefenceEstablishmentBundle = [
  DefenceEstablishmentMixin as Mixin,
  GovernmentBuildingMixin as Mixin];
