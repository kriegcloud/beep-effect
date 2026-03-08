import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface CriticReview<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
}

export function CriticReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CriticReview & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CriticReviewClass extends ReviewMixin(Resource) {
  }
  return CriticReviewClass as any
}
CriticReviewMixin.appliesTo = schema.CriticReview
CriticReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<CriticReview>([ReviewMixin, CriticReviewMixin], { types: [schema.CriticReview] }, env)
