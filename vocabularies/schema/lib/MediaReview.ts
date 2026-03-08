import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ReviewMixin } from './Review.js';

export interface MediaReview<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Review<D>, rdfine.RdfResource<D> {
  mediaAuthenticityCategory: Schema.MediaManipulationRatingEnumeration | undefined;
  originalMediaContextDescription: string | undefined;
  originalMediaLink: Schema.MediaObject<D> | Schema.WebPage<D> | undefined;
}

export function MediaReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MediaReview & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MediaReviewClass extends ReviewMixin(Resource) {
    @rdfine.property()
    mediaAuthenticityCategory: Schema.MediaManipulationRatingEnumeration | undefined;
    @rdfine.property.literal()
    originalMediaContextDescription: string | undefined;
    @rdfine.property.resource()
    originalMediaLink: Schema.MediaObject | Schema.WebPage | undefined;
  }
  return MediaReviewClass as any
}
MediaReviewMixin.appliesTo = schema.MediaReview
MediaReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<MediaReview>([ReviewMixin, MediaReviewMixin], { types: [schema.MediaReview] }, env)
