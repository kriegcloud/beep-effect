import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { VisualArtworkMixin } from './VisualArtwork.js';

export interface CoverArt<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.VisualArtwork<D>, rdfine.RdfResource<D> {
}

export function CoverArtMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CoverArt & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CoverArtClass extends VisualArtworkMixin(Resource) {
  }
  return CoverArtClass as any
}
CoverArtMixin.appliesTo = schema.CoverArt
CoverArtMixin.createFactory = (env: RdfineEnvironment) => createFactory<CoverArt>([VisualArtworkMixin, CoverArtMixin], { types: [schema.CoverArt] }, env)
