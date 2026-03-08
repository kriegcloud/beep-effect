import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { AboutPageMixin } from '../lib/AboutPage.js';
import { ArticleMixin } from '../lib/Article.js';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { NewsMediaOrganizationMixin } from '../lib/NewsMediaOrganization.js';
import { OrganizationMixin } from '../lib/Organization.js';

export const NewsMediaOrganizationBundle = [
  AboutPageMixin as Mixin,
  ArticleMixin as Mixin,
  CreativeWorkMixin as Mixin,
  NewsMediaOrganizationMixin as Mixin,
  OrganizationMixin as Mixin];
