import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface UserReview<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
}

export function UserReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<UserReview & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class UserReviewClass extends ReviewMixin(Resource) {
  }
  return UserReviewClass as any
}
UserReviewMixin.appliesTo = schema.UserReview
UserReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<UserReview>([ReviewMixin, UserReviewMixin], { types: [schema.UserReview] }, env)
