import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface LifestyleModification<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
}

export function LifestyleModificationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<LifestyleModification & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class LifestyleModificationClass extends MedicalEntityMixin(Resource) {
  }
  return LifestyleModificationClass as any
}
LifestyleModificationMixin.appliesTo = schema.LifestyleModification
LifestyleModificationMixin.createFactory = (env: RdfineEnvironment) => createFactory<LifestyleModification>([MedicalEntityMixin, LifestyleModificationMixin], { types: [schema.LifestyleModification] }, env)
