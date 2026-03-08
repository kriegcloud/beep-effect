import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalOrganizationMixin } from './MedicalOrganization.js';

export interface DiagnosticLab<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalOrganization<D>, rdfine.RdfResource<D> {
  availableTest: Schema.MedicalTest<D> | undefined;
}

export function DiagnosticLabMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DiagnosticLab & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DiagnosticLabClass extends MedicalOrganizationMixin(Resource) {
    @rdfine.property.resource()
    availableTest: Schema.MedicalTest | undefined;
  }
  return DiagnosticLabClass as any
}
DiagnosticLabMixin.appliesTo = schema.DiagnosticLab
DiagnosticLabMixin.createFactory = (env: RdfineEnvironment) => createFactory<DiagnosticLab>([MedicalOrganizationMixin, DiagnosticLabMixin], { types: [schema.DiagnosticLab] }, env)
