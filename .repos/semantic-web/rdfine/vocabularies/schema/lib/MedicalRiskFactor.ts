import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalRiskFactor<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  increasesRiskOf: Schema.MedicalEntity<D> | undefined;
}

export function MedicalRiskFactorMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalRiskFactor & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalRiskFactorClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    increasesRiskOf: Schema.MedicalEntity | undefined;
  }
  return MedicalRiskFactorClass as any
}
MedicalRiskFactorMixin.appliesTo = schema.MedicalRiskFactor
MedicalRiskFactorMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalRiskFactor>([MedicalEntityMixin, MedicalRiskFactorMixin], { types: [schema.MedicalRiskFactor] }, env)
