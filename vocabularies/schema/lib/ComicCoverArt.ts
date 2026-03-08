import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ComicStoryMixin } from './ComicStory.js';
import { CoverArtMixin } from './CoverArt.js';

export interface ComicCoverArt<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.ComicStory<D>, Schema.CoverArt<D>, rdfine.RdfResource<D> {
}

export function ComicCoverArtMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComicCoverArt & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComicCoverArtClass extends CoverArtMixin(ComicStoryMixin(Resource)) {
  }
  return ComicCoverArtClass as any
}
ComicCoverArtMixin.appliesTo = schema.ComicCoverArt
ComicCoverArtMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComicCoverArt>([CoverArtMixin, ComicStoryMixin, ComicCoverArtMixin], { types: [schema.ComicCoverArt] }, env)
