import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CriticReviewMixin } from './CriticReview.js';
import { NewsArticleMixin } from './NewsArticle.js';

export interface ReviewNewsArticle<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CriticReview<D>, Schema.NewsArticle<D>, rdfine.RdfResource<D> {
}

export function ReviewNewsArticleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ReviewNewsArticle & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReviewNewsArticleClass extends NewsArticleMixin(CriticReviewMixin(Resource)) {
  }
  return ReviewNewsArticleClass as any
}
ReviewNewsArticleMixin.appliesTo = schema.ReviewNewsArticle
ReviewNewsArticleMixin.createFactory = (env: RdfineEnvironment) => createFactory<ReviewNewsArticle>([NewsArticleMixin, CriticReviewMixin, ReviewNewsArticleMixin], { types: [schema.ReviewNewsArticle] }, env)
