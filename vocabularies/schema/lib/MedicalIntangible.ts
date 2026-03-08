import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalIntangible<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
}

export function MedicalIntangibleMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalIntangible & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalIntangibleClass extends MedicalEntityMixin(Resource) {
  }
  return MedicalIntangibleClass as any
}
MedicalIntangibleMixin.appliesTo = schema.MedicalIntangible
MedicalIntangibleMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalIntangible>([MedicalEntityMixin, MedicalIntangibleMixin], { types: [schema.MedicalIntangible] }, env)
