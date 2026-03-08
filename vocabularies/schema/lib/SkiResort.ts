import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ResortMixin } from './Resort.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface SkiResort<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Resort<D>, Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function SkiResortMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SkiResort & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SkiResortClass extends SportsActivityLocationMixin(ResortMixin(Resource)) {
  }
  return SkiResortClass as any
}
SkiResortMixin.appliesTo = schema.SkiResort
SkiResortMixin.createFactory = (env: RdfineEnvironment) => createFactory<SkiResort>([SportsActivityLocationMixin, ResortMixin, SkiResortMixin], { types: [schema.SkiResort] }, env)
