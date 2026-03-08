import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface MediaReviewItem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  mediaItemAppearance: Schema.MediaObject<D> | undefined;
}

export function MediaReviewItemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MediaReviewItem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MediaReviewItemClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    mediaItemAppearance: Schema.MediaObject | undefined;
  }
  return MediaReviewItemClass as any
}
MediaReviewItemMixin.appliesTo = schema.MediaReviewItem
MediaReviewItemMixin.createFactory = (env: RdfineEnvironment) => createFactory<MediaReviewItem>([CreativeWorkMixin, MediaReviewItemMixin], { types: [schema.MediaReviewItem] }, env)
