import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { TherapeuticProcedureMixin } from './TherapeuticProcedure.js';

export interface MedicalTherapy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.TherapeuticProcedure<D>, rdfine.RdfResource<D> {
  contraindication: Schema.MedicalContraindication<D> | undefined;
  contraindicationLiteral: string | undefined;
  duplicateTherapy: Schema.MedicalTherapy<D> | undefined;
  seriousAdverseOutcome: Schema.MedicalEntity<D> | undefined;
}

export function MedicalTherapyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalTherapy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalTherapyClass extends TherapeuticProcedureMixin(Resource) {
    @rdfine.property.resource()
    contraindication: Schema.MedicalContraindication | undefined;
    @rdfine.property.literal({ path: schema.contraindication })
    contraindicationLiteral: string | undefined;
    @rdfine.property.resource()
    duplicateTherapy: Schema.MedicalTherapy | undefined;
    @rdfine.property.resource()
    seriousAdverseOutcome: Schema.MedicalEntity | undefined;
  }
  return MedicalTherapyClass as any
}
MedicalTherapyMixin.appliesTo = schema.MedicalTherapy
MedicalTherapyMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalTherapy>([TherapeuticProcedureMixin, MedicalTherapyMixin], { types: [schema.MedicalTherapy] }, env)
