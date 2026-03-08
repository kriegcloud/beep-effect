import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PlayActionMixin } from './PlayAction.js';

export interface ExerciseAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PlayAction<D>, rdfine.RdfResource<D> {
  course: Schema.Place<D> | undefined;
  diet: Schema.Diet<D> | undefined;
  distance: Schema.Distance<D> | undefined;
  exerciseCourse: Schema.Place<D> | undefined;
  exercisePlan: Schema.ExercisePlan<D> | undefined;
  exerciseRelatedDiet: Schema.Diet<D> | undefined;
  exerciseType: string | undefined;
  fromLocation: Schema.Place<D> | undefined;
  opponent: Schema.Person<D> | undefined;
  sportsActivityLocation: Schema.SportsActivityLocation<D> | undefined;
  sportsEvent: Schema.SportsEvent<D> | undefined;
  sportsTeam: Schema.SportsTeam<D> | undefined;
  toLocation: Schema.Place<D> | undefined;
}

export function ExerciseActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExerciseAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ExerciseActionClass extends PlayActionMixin(Resource) {
    @rdfine.property.resource()
    course: Schema.Place | undefined;
    @rdfine.property.resource()
    diet: Schema.Diet | undefined;
    @rdfine.property.resource()
    distance: Schema.Distance | undefined;
    @rdfine.property.resource()
    exerciseCourse: Schema.Place | undefined;
    @rdfine.property.resource()
    exercisePlan: Schema.ExercisePlan | undefined;
    @rdfine.property.resource()
    exerciseRelatedDiet: Schema.Diet | undefined;
    @rdfine.property.literal()
    exerciseType: string | undefined;
    @rdfine.property.resource()
    fromLocation: Schema.Place | undefined;
    @rdfine.property.resource()
    opponent: Schema.Person | undefined;
    @rdfine.property.resource()
    sportsActivityLocation: Schema.SportsActivityLocation | undefined;
    @rdfine.property.resource()
    sportsEvent: Schema.SportsEvent | undefined;
    @rdfine.property.resource()
    sportsTeam: Schema.SportsTeam | undefined;
    @rdfine.property.resource()
    toLocation: Schema.Place | undefined;
  }
  return ExerciseActionClass as any
}
ExerciseActionMixin.appliesTo = schema.ExerciseAction
ExerciseActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExerciseAction>([PlayActionMixin, ExerciseActionMixin], { types: [schema.ExerciseAction] }, env)
