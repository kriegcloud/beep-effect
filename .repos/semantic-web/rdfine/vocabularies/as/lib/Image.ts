import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { DocumentMixin } from './Document.js';

export interface Image<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Document<D>, rdfine.RdfResource<D> {
}

export function ImageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Image & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ImageClass extends DocumentMixin(Resource) {
  }
  return ImageClass as any
}
ImageMixin.appliesTo = as.Image
ImageMixin.createFactory = (env: RdfineEnvironment) => createFactory<Image>([DocumentMixin, ImageMixin], { types: [as.Image] }, env)
