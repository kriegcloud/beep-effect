import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { DigitalDocumentMixin } from '../lib/DigitalDocument.js';
import { DigitalDocumentPermissionMixin } from '../lib/DigitalDocumentPermission.js';

export const DigitalDocumentBundle = [
  CreativeWorkMixin as Mixin,
  DigitalDocumentMixin as Mixin,
  DigitalDocumentPermissionMixin as Mixin];
