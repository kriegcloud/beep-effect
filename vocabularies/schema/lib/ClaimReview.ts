import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface ClaimReview<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
  claimReviewed: string | undefined;
}

export function ClaimReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ClaimReview & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ClaimReviewClass extends ReviewMixin(Resource) {
    @rdfine.property.literal()
    claimReviewed: string | undefined;
  }
  return ClaimReviewClass as any
}
ClaimReviewMixin.appliesTo = schema.ClaimReview
ClaimReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<ClaimReview>([ReviewMixin, ClaimReviewMixin], { types: [schema.ClaimReview] }, env)
