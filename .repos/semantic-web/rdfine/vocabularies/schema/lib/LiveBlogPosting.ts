import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { BlogPostingMixin } from './BlogPosting.js';

export interface LiveBlogPosting<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.BlogPosting<D>, rdfine.RdfResource<D> {
  coverageEndTime: Date | undefined;
  coverageStartTime: Date | undefined;
  liveBlogUpdate: Schema.BlogPosting<D> | undefined;
}

export function LiveBlogPostingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LiveBlogPosting & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LiveBlogPostingClass extends BlogPostingMixin(Resource) {
    @rdfine.property.literal({ type: Date })
    coverageEndTime: Date | undefined;
    @rdfine.property.literal({ type: Date })
    coverageStartTime: Date | undefined;
    @rdfine.property.resource()
    liveBlogUpdate: Schema.BlogPosting | undefined;
  }
  return LiveBlogPostingClass as any
}
LiveBlogPostingMixin.appliesTo = schema.LiveBlogPosting
LiveBlogPostingMixin.createFactory = (env: RdfineEnvironment) => createFactory<LiveBlogPosting>([BlogPostingMixin, LiveBlogPostingMixin], { types: [schema.LiveBlogPosting] }, env)
