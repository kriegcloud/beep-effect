import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalTestMixin } from './MedicalTest.js';

export interface ImagingTest<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalTest<D>, rdfine.RdfResource<D> {
  imagingTechnique: Schema.MedicalImagingTechnique | undefined;
}

export function ImagingTestMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ImagingTest & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ImagingTestClass extends MedicalTestMixin(Resource) {
    @rdfine.property()
    imagingTechnique: Schema.MedicalImagingTechnique | undefined;
  }
  return ImagingTestClass as any
}
ImagingTestMixin.appliesTo = schema.ImagingTest
ImagingTestMixin.createFactory = (env: RdfineEnvironment) => createFactory<ImagingTest>([MedicalTestMixin, ImagingTestMixin], { types: [schema.ImagingTest] }, env)
