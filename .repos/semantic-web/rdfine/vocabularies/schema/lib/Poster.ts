import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Poster<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
}

export function PosterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Poster & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PosterClass extends CreativeWorkMixin(Resource) {
  }
  return PosterClass as any
}
PosterMixin.appliesTo = schema.Poster
PosterMixin.createFactory = (env: RdfineEnvironment) => createFactory<Poster>([CreativeWorkMixin, PosterMixin], { types: [schema.Poster] }, env)
