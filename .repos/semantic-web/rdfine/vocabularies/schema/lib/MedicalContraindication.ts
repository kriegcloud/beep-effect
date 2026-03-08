import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalContraindication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
}

export function MedicalContraindicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalContraindication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalContraindicationClass extends MedicalEntityMixin(Resource) {
  }
  return MedicalContraindicationClass as any
}
MedicalContraindicationMixin.appliesTo = schema.MedicalContraindication
MedicalContraindicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalContraindication>([MedicalEntityMixin, MedicalContraindicationMixin], { types: [schema.MedicalContraindication] }, env)
