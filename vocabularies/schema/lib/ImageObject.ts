import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MediaObjectMixin } from './MediaObject.js';

export interface ImageObject<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MediaObject<D>, rdfine.RdfResource<D> {
  caption: Schema.MediaObject<D> | undefined;
  captionLiteral: string | undefined;
  embeddedTextCaption: string | undefined;
  exifData: Schema.PropertyValue<D> | undefined;
  exifDataLiteral: string | undefined;
  representativeOfPage: boolean | undefined;
  thumbnail: Schema.ImageObject<D> | undefined;
}

export function ImageObjectMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ImageObject & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ImageObjectClass extends MediaObjectMixin(Resource) {
    @rdfine.property.resource()
    caption: Schema.MediaObject | undefined;
    @rdfine.property.literal({ path: schema.caption })
    captionLiteral: string | undefined;
    @rdfine.property.literal()
    embeddedTextCaption: string | undefined;
    @rdfine.property.resource()
    exifData: Schema.PropertyValue | undefined;
    @rdfine.property.literal({ path: schema.exifData })
    exifDataLiteral: string | undefined;
    @rdfine.property.literal({ type: Boolean })
    representativeOfPage: boolean | undefined;
    @rdfine.property.resource()
    thumbnail: Schema.ImageObject | undefined;
  }
  return ImageObjectClass as any
}
ImageObjectMixin.appliesTo = schema.ImageObject
ImageObjectMixin.createFactory = (env: RdfineEnvironment) => createFactory<ImageObject>([MediaObjectMixin, ImageObjectMixin], { types: [schema.ImageObject] }, env)
