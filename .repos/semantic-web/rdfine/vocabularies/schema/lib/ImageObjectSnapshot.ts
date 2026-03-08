import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ImageObjectMixin } from './ImageObject.js';

export interface ImageObjectSnapshot<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ImageObject<D>, rdfine.RdfResource<D> {
}

export function ImageObjectSnapshotMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ImageObjectSnapshot & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ImageObjectSnapshotClass extends ImageObjectMixin(Resource) {
  }
  return ImageObjectSnapshotClass as any
}
ImageObjectSnapshotMixin.appliesTo = schema.ImageObjectSnapshot
ImageObjectSnapshotMixin.createFactory = (env: RdfineEnvironment) => createFactory<ImageObjectSnapshot>([ImageObjectMixin, ImageObjectSnapshotMixin], { types: [schema.ImageObjectSnapshot] }, env)
