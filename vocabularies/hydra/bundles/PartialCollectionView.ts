import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { PartialCollectionViewMixin } from '../lib/PartialCollectionView.js';
import { ResourceMixin } from '../lib/Resource.js';

export const PartialCollectionViewBundle = [
  PartialCollectionViewMixin as Mixin,
  ResourceMixin as Mixin];
