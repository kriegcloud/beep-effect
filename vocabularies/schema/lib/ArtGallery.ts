import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface ArtGallery<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
}

export function ArtGalleryMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ArtGallery & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ArtGalleryClass extends EntertainmentBusinessMixin(Resource) {
  }
  return ArtGalleryClass as any
}
ArtGalleryMixin.appliesTo = schema.ArtGallery
ArtGalleryMixin.createFactory = (env: RdfineEnvironment) => createFactory<ArtGallery>([EntertainmentBusinessMixin, ArtGalleryMixin], { types: [schema.ArtGallery] }, env)
