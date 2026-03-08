import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalIndicationMixin } from './MedicalIndication.js';

export interface PreventionIndication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalIndication<D>, rdfine.RdfResource<D> {
}

export function PreventionIndicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PreventionIndication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PreventionIndicationClass extends MedicalIndicationMixin(Resource) {
  }
  return PreventionIndicationClass as any
}
PreventionIndicationMixin.appliesTo = schema.PreventionIndication
PreventionIndicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<PreventionIndication>([MedicalIndicationMixin, PreventionIndicationMixin], { types: [schema.PreventionIndication] }, env)
