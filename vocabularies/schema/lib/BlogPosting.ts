import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SocialMediaPostingMixin } from './SocialMediaPosting.js';

export interface BlogPosting<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SocialMediaPosting<D>, rdfine.RdfResource<D> {
}

export function BlogPostingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BlogPosting & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BlogPostingClass extends SocialMediaPostingMixin(Resource) {
  }
  return BlogPostingClass as any
}
BlogPostingMixin.appliesTo = schema.BlogPosting
BlogPostingMixin.createFactory = (env: RdfineEnvironment) => createFactory<BlogPosting>([SocialMediaPostingMixin, BlogPostingMixin], { types: [schema.BlogPosting] }, env)
