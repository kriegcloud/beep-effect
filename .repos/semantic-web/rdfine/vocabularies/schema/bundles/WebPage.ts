import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { BreadcrumbListMixin } from '../lib/BreadcrumbList.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { ImageObjectMixin } from '../lib/ImageObject.js';
import { OrganizationMixin } from '../lib/Organization.js';
import { PersonMixin } from '../lib/Person.js';
import { SpeakableSpecificationMixin } from '../lib/SpeakableSpecification.js';
import { WebPageElementMixin } from '../lib/WebPageElement.js';
import { WebPageMixin } from '../lib/WebPage.js';

export const WebPageBundle = [
  BreadcrumbListMixin as Mixin,
  CreativeWorkMixin as Mixin,
  ImageObjectMixin as Mixin,
  OrganizationMixin as Mixin,
  PersonMixin as Mixin,
  SpeakableSpecificationMixin as Mixin,
  WebPageElementMixin as Mixin,
  WebPageMixin as Mixin];
