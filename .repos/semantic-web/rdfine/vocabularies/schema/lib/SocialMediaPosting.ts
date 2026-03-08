import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ArticleMixin } from './Article.js';

export interface SocialMediaPosting<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Article<D>, rdfine.RdfResource<D> {
  sharedContent: Schema.CreativeWork<D> | undefined;
}

export function SocialMediaPostingMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SocialMediaPosting & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SocialMediaPostingClass extends ArticleMixin(Resource) {
    @rdfine.property.resource()
    sharedContent: Schema.CreativeWork | undefined;
  }
  return SocialMediaPostingClass as any
}
SocialMediaPostingMixin.appliesTo = schema.SocialMediaPosting
SocialMediaPostingMixin.createFactory = (env: RdfineEnvironment) => createFactory<SocialMediaPosting>([ArticleMixin, SocialMediaPostingMixin], { types: [schema.SocialMediaPosting] }, env)
