import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';
import { PhysicalActivityMixin } from './PhysicalActivity.js';

export interface ExercisePlan<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, Schema.PhysicalActivity<D>, rdfine.RdfResource<D> {
  activityDuration: Schema.Duration<D> | Schema.QuantitativeValue<D> | undefined;
  activityFrequency: Schema.QuantitativeValue<D> | undefined;
  activityFrequencyLiteral: string | undefined;
  additionalVariable: string | undefined;
  exerciseType: string | undefined;
  intensity: Schema.QuantitativeValue<D> | undefined;
  intensityLiteral: string | undefined;
  repetitions: Schema.QuantitativeValue<D> | undefined;
  repetitionsLiteral: number | undefined;
  restPeriods: Schema.QuantitativeValue<D> | undefined;
  restPeriodsLiteral: string | undefined;
  workload: Schema.Energy<D> | Schema.QuantitativeValue<D> | undefined;
}

export function ExercisePlanMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ExercisePlan & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ExercisePlanClass extends PhysicalActivityMixin(CreativeWorkMixin(Resource)) {
    @rdfine.property.resource()
    activityDuration: Schema.Duration | Schema.QuantitativeValue | undefined;
    @rdfine.property.resource()
    activityFrequency: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.activityFrequency })
    activityFrequencyLiteral: string | undefined;
    @rdfine.property.literal()
    additionalVariable: string | undefined;
    @rdfine.property.literal()
    exerciseType: string | undefined;
    @rdfine.property.resource()
    intensity: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.intensity })
    intensityLiteral: string | undefined;
    @rdfine.property.resource()
    repetitions: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.repetitions, type: Number })
    repetitionsLiteral: number | undefined;
    @rdfine.property.resource()
    restPeriods: Schema.QuantitativeValue | undefined;
    @rdfine.property.literal({ path: schema.restPeriods })
    restPeriodsLiteral: string | undefined;
    @rdfine.property.resource()
    workload: Schema.Energy | Schema.QuantitativeValue | undefined;
  }
  return ExercisePlanClass as any
}
ExercisePlanMixin.appliesTo = schema.ExercisePlan
ExercisePlanMixin.createFactory = (env: RdfineEnvironment) => createFactory<ExercisePlan>([PhysicalActivityMixin, CreativeWorkMixin, ExercisePlanMixin], { types: [schema.ExercisePlan] }, env)
