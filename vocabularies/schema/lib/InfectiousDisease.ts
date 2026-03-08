import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalConditionMixin } from './MedicalCondition.js';

export interface InfectiousDisease<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalCondition<D>, rdfine.RdfResource<D> {
  infectiousAgent: string | undefined;
  infectiousAgentClass: Schema.InfectiousAgentClass | undefined;
  transmissionMethod: string | undefined;
}

export function InfectiousDiseaseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InfectiousDisease & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InfectiousDiseaseClass extends MedicalConditionMixin(Resource) {
    @rdfine.property.literal()
    infectiousAgent: string | undefined;
    @rdfine.property()
    infectiousAgentClass: Schema.InfectiousAgentClass | undefined;
    @rdfine.property.literal()
    transmissionMethod: string | undefined;
  }
  return InfectiousDiseaseClass as any
}
InfectiousDiseaseMixin.appliesTo = schema.InfectiousDisease
InfectiousDiseaseMixin.createFactory = (env: RdfineEnvironment) => createFactory<InfectiousDisease>([MedicalConditionMixin, InfectiousDiseaseMixin], { types: [schema.InfectiousDisease] }, env)
