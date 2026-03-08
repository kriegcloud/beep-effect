import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface AskPublicNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function AskPublicNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AskPublicNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AskPublicNewsArticleClass extends NewsArticleMixin(Resource) {
  }
  return AskPublicNewsArticleClass as any
}
AskPublicNewsArticleMixin.appliesTo = schema.AskPublicNewsArticle
AskPublicNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<AskPublicNewsArticle>([NewsArticleMixin, AskPublicNewsArticleMixin], { types: [schema.AskPublicNewsArticle] }, env)
