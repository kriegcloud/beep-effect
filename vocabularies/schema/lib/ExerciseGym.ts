import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface ExerciseGym<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function ExerciseGymMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExerciseGym & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ExerciseGymClass extends SportsActivityLocationMixin(Resource) {
  }
  return ExerciseGymClass as any
}
ExerciseGymMixin.appliesTo = schema.ExerciseGym
ExerciseGymMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExerciseGym>([SportsActivityLocationMixin, ExerciseGymMixin], { types: [schema.ExerciseGym] }, env)
