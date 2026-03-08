import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Blog<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  blogPost: Schema.BlogPosting<D> | undefined;
  blogPosts: Schema.BlogPosting<D> | undefined;
  issn: string | undefined;
}

export function BlogMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Blog & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BlogClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    blogPost: Schema.BlogPosting | undefined;
    @rdfine.property.resource()
    blogPosts: Schema.BlogPosting | undefined;
    @rdfine.property.literal()
    issn: string | undefined;
  }
  return BlogClass as any
}
BlogMixin.appliesTo = schema.Blog
BlogMixin.createFactory = (env: RdfineEnvironment) => createFactory<Blog>([CreativeWorkMixin, BlogMixin], { types: [schema.Blog] }, env)
