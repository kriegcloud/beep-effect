import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalIndication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
}

export function MedicalIndicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalIndication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalIndicationClass extends MedicalEntityMixin(Resource) {
  }
  return MedicalIndicationClass as any
}
MedicalIndicationMixin.appliesTo = schema.MedicalIndication
MedicalIndicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalIndication>([MedicalEntityMixin, MedicalIndicationMixin], { types: [schema.MedicalIndication] }, env)
