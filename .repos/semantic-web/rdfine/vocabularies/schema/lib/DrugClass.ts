import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface DrugClass<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  drug: Schema.Drug<D> | undefined;
}

export function DrugClassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<DrugClass & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class DrugClassClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.resource()
    drug: Schema.Drug | undefined;
  }
  return DrugClassClass as any
}
DrugClassMixin.appliesTo = schema.DrugClass
DrugClassMixin.createFactory = (env: RdfineEnvironment) => createFactory<DrugClass>([MedicalEntityMixin, DrugClassMixin], { types: [schema.DrugClass] }, env)
