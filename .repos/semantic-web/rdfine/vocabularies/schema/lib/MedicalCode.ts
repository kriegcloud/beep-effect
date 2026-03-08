import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CategoryCodeMixin } from './CategoryCode.js';
import { MedicalIntangibleMixin } from './MedicalIntangible.js';

export interface MedicalCode<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CategoryCode<D>, Schema.MedicalIntangible<D>, rdfine.RdfResource<D> {
  codeValue: string | undefined;
  codingSystem: string | undefined;
}

export function MedicalCodeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalCode & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalCodeClass extends MedicalIntangibleMixin(CategoryCodeMixin(Resource)) {
    @rdfine.property.literal()
    codeValue: string | undefined;
    @rdfine.property.literal()
    codingSystem: string | undefined;
  }
  return MedicalCodeClass as any
}
MedicalCodeMixin.appliesTo = schema.MedicalCode
MedicalCodeMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalCode>([MedicalIntangibleMixin, CategoryCodeMixin, MedicalCodeMixin], { types: [schema.MedicalCode] }, env)
