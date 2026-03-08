import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaGalleryMixin } from './MediaGallery.js';

export interface VideoGallery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaGallery<D>, rdfine.RdfResource<D> {
}

export function VideoGalleryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<VideoGallery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class VideoGalleryClass extends MediaGalleryMixin(Resource) {
  }
  return VideoGalleryClass as any
}
VideoGalleryMixin.appliesTo = schema.VideoGallery
VideoGalleryMixin.createFactory = (env: RdfineEnvironment) => createFactory<VideoGallery>([MediaGalleryMixin, VideoGalleryMixin], { types: [schema.VideoGallery] }, env)
