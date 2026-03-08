import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CollectionPageMixin } from './CollectionPage.js';

export interface MediaGallery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CollectionPage<D>, rdfine.RdfResource<D> {
}

export function MediaGalleryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MediaGallery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MediaGalleryClass extends CollectionPageMixin(Resource) {
  }
  return MediaGalleryClass as any
}
MediaGalleryMixin.appliesTo = schema.MediaGallery
MediaGalleryMixin.createFactory = (env: RdfineEnvironment) => createFactory<MediaGallery>([CollectionPageMixin, MediaGalleryMixin], { types: [schema.MediaGallery] }, env)
