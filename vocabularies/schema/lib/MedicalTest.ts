import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalTest<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  affectedBy: Schema.Drug<D> | undefined;
  normalRange: string | undefined;
  normalRangeTerm: Schema.MedicalEnumeration | undefined;
  signDetected: Schema.MedicalSign<D> | undefined;
  usedToDiagnose: Schema.MedicalCondition<D> | undefined;
  usesDevice: Schema.MedicalDevice<D> | undefined;
}

export function MedicalTestMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalTest & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalTestClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    affectedBy: Schema.Drug | undefined;
    @rdfine.property.literal()
    normalRange: string | undefined;
    @rdfine.property({ path: schema.normalRange })
    normalRangeTerm: Schema.MedicalEnumeration | undefined;
    @rdfine.property.resource()
    signDetected: Schema.MedicalSign | undefined;
    @rdfine.property.resource()
    usedToDiagnose: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    usesDevice: Schema.MedicalDevice | undefined;
  }
  return MedicalTestClass as any
}
MedicalTestMixin.appliesTo = schema.MedicalTest
MedicalTestMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalTest>([MedicalEntityMixin, MedicalTestMixin], { types: [schema.MedicalTest] }, env)
