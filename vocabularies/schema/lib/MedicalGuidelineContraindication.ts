import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalGuidelineMixin } from './MedicalGuideline.js';

export interface MedicalGuidelineContraindication<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalGuideline<D>, rdfine.RdfResource<D> {
}

export function MedicalGuidelineContraindicationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalGuidelineContraindication & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalGuidelineContraindicationClass extends MedicalGuidelineMixin(Resource) {
  }
  return MedicalGuidelineContraindicationClass as any
}
MedicalGuidelineContraindicationMixin.appliesTo = schema.MedicalGuidelineContraindication
MedicalGuidelineContraindicationMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalGuidelineContraindication>([MedicalGuidelineMixin, MedicalGuidelineContraindicationMixin], { types: [schema.MedicalGuidelineContraindication] }, env)
