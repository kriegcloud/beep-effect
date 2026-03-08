import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface OpinionNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function OpinionNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<OpinionNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class OpinionNewsArticleClass extends NewsArticleMixin(Resource) {
  }
  return OpinionNewsArticleClass as any
}
OpinionNewsArticleMixin.appliesTo = schema.OpinionNewsArticle
OpinionNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<OpinionNewsArticle>([NewsArticleMixin, OpinionNewsArticleMixin], { types: [schema.OpinionNewsArticle] }, env)
