import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalIntangibleMixin } from './MedicalIntangible.js';

export interface DDxElement<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalIntangible<D>, rdfine.RdfResource<D> {
  diagnosis: Schema.MedicalCondition<D> | undefined;
  distinguishingSign: Schema.MedicalSignOrSymptom<D> | undefined;
}

export function DDxElementMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DDxElement & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DDxElementClass extends MedicalIntangibleMixin(Resource) {
    @rdfine.property.resource()
    diagnosis: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    distinguishingSign: Schema.MedicalSignOrSymptom | undefined;
  }
  return DDxElementClass as any
}
DDxElementMixin.appliesTo = schema.DDxElement
DDxElementMixin.createFactory = (env: RdfineEnvironment) => createFactory<DDxElement>([MedicalIntangibleMixin, DDxElementMixin], { types: [schema.DDxElement] }, env)
