import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CivicStructureMixin } from './CivicStructure.js';
import { EntertainmentBusinessMixin } from './EntertainmentBusiness.js';

export interface MovieTheater<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CivicStructure<D>, Schema.EntertainmentBusiness<D>, rdfine.RdfResource<D> {
  screenCount: number | undefined;
}

export function MovieTheaterMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MovieTheater & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MovieTheaterClass extends EntertainmentBusinessMixin(CivicStructureMixin(Resource)) {
    @rdfine.property.literal({ type: Number })
    screenCount: number | undefined;
  }
  return MovieTheaterClass as any
}
MovieTheaterMixin.appliesTo = schema.MovieTheater
MovieTheaterMixin.createFactory = (env: RdfineEnvironment) => createFactory<MovieTheater>([EntertainmentBusinessMixin, CivicStructureMixin, MovieTheaterMixin], { types: [schema.MovieTheater] }, env)
