import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaGalleryMixin } from './MediaGallery.js';

export interface ImageGallery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaGallery<D>, rdfine.RdfResource<D> {
}

export function ImageGalleryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ImageGallery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ImageGalleryClass extends MediaGalleryMixin(Resource) {
  }
  return ImageGalleryClass as any
}
ImageGalleryMixin.appliesTo = schema.ImageGallery
ImageGalleryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ImageGallery>([MediaGalleryMixin, ImageGalleryMixin], { types: [schema.ImageGallery] }, env)
