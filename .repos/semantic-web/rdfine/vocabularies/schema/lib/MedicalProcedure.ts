import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalProcedure<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  bodyLocation: string | undefined;
  followup: string | undefined;
  howPerformed: string | undefined;
  preparation: Schema.MedicalEntity<D> | undefined;
  preparationLiteral: string | undefined;
  procedureType: Schema.MedicalProcedureType | undefined;
  status: string | undefined;
  statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
}

export function MedicalProcedureMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalProcedure & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalProcedureClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.literal()
    bodyLocation: string | undefined;
    @rdfine.property.literal()
    followup: string | undefined;
    @rdfine.property.literal()
    howPerformed: string | undefined;
    @rdfine.property.resource()
    preparation: Schema.MedicalEntity | undefined;
    @rdfine.property.literal({ path: schema.preparation })
    preparationLiteral: string | undefined;
    @rdfine.property()
    procedureType: Schema.MedicalProcedureType | undefined;
    @rdfine.property.literal()
    status: string | undefined;
    @rdfine.property({ path: schema.status })
    statusTerm: Schema.EventStatusType | Schema.MedicalStudyStatus | undefined;
  }
  return MedicalProcedureClass as any
}
MedicalProcedureMixin.appliesTo = schema.MedicalProcedure
MedicalProcedureMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalProcedure>([MedicalEntityMixin, MedicalProcedureMixin], { types: [schema.MedicalProcedure] }, env)
