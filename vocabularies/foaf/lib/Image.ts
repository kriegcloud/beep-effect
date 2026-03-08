import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { foaf } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Foaf from '../index.js';
import { DocumentMixin } from './Document.js';

export interface Image<D extends RDF.DatasetCore = RDF.DatasetCore> extends Foaf.Document<D>, rdfine.RdfResource<D> {
  depicts: RDF.NamedNode | undefined;
  thumbnail: Foaf.Image<D> | undefined;
}

export function ImageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Image & RdfResourceCore> & Base {
  @rdfine.namespace(foaf)
  class ImageClass extends DocumentMixin(Resource) {
    @rdfine.property()
    depicts: RDF.NamedNode | undefined;
    @rdfine.property.resource({ as: [ImageMixin] })
    thumbnail: Foaf.Image | undefined;
  }
  return ImageClass as any
}
ImageMixin.appliesTo = foaf.Image
ImageMixin.createFactory = (env: RdfineEnvironment) => createFactory<Image>([DocumentMixin, ImageMixin], { types: [foaf.Image] }, env)
