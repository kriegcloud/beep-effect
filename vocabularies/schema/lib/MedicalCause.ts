import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalCause<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  causeOf: Schema.MedicalEntity<D> | undefined;
}

export function MedicalCauseMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalCause & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalCauseClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    causeOf: Schema.MedicalEntity | undefined;
  }
  return MedicalCauseClass as any
}
MedicalCauseMixin.appliesTo = schema.MedicalCause
MedicalCauseMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalCause>([MedicalEntityMixin, MedicalCauseMixin], { types: [schema.MedicalCause] }, env)
