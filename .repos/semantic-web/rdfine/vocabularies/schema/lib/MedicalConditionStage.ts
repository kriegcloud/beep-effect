import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalIntangibleMixin } from './MedicalIntangible.js';

export interface MedicalConditionStage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalIntangible<D>, rdfine.RdfResource<D> {
  stageAsNumber: number | undefined;
  subStageSuffix: string | undefined;
}

export function MedicalConditionStageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalConditionStage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalConditionStageClass extends MedicalIntangibleMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    stageAsNumber: number | undefined;
    @rdfine.property.literal()
    subStageSuffix: string | undefined;
  }
  return MedicalConditionStageClass as any
}
MedicalConditionStageMixin.appliesTo = schema.MedicalConditionStage
MedicalConditionStageMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalConditionStage>([MedicalIntangibleMixin, MedicalConditionStageMixin], { types: [schema.MedicalConditionStage] }, env)
