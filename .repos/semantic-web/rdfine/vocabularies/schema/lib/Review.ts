import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Review<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  associatedClaimReview: Schema.Review<D> | undefined;
  associatedMediaReview: Schema.Review<D> | undefined;
  associatedReview: Schema.Review<D> | undefined;
  itemReviewed: Schema.Thing<D> | undefined;
  negativeNotes: Schema.ItemList<D> | Schema.ListItem<D> | Schema.WebContent<D> | undefined;
  negativeNotesLiteral: string | undefined;
  positiveNotes: Schema.ItemList<D> | Schema.ListItem<D> | Schema.WebContent<D> | undefined;
  positiveNotesLiteral: string | undefined;
  reviewAspect: string | undefined;
  reviewBody: string | undefined;
  reviewRating: Schema.Rating<D> | undefined;
}

export function ReviewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Review & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ReviewClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    associatedClaimReview: Schema.Review | undefined;
    @rdfine.property.resource()
    associatedMediaReview: Schema.Review | undefined;
    @rdfine.property.resource()
    associatedReview: Schema.Review | undefined;
    @rdfine.property.resource()
    itemReviewed: Schema.Thing | undefined;
    @rdfine.property.resource()
    negativeNotes: Schema.ItemList | Schema.ListItem | Schema.WebContent | undefined;
    @rdfine.property.literal({ path: schema.negativeNotes })
    negativeNotesLiteral: string | undefined;
    @rdfine.property.resource()
    positiveNotes: Schema.ItemList | Schema.ListItem | Schema.WebContent | undefined;
    @rdfine.property.literal({ path: schema.positiveNotes })
    positiveNotesLiteral: string | undefined;
    @rdfine.property.literal()
    reviewAspect: string | undefined;
    @rdfine.property.literal()
    reviewBody: string | undefined;
    @rdfine.property.resource()
    reviewRating: Schema.Rating | undefined;
  }
  return ReviewClass as any
}
ReviewMixin.appliesTo = schema.Review
ReviewMixin.createFactory = (env: RdfineEnvironment) => createFactory<Review>([CreativeWorkMixin, ReviewMixin], { types: [schema.Review] }, env)
