import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AnatomicalStructureMixin } from './AnatomicalStructure.js';

export interface Joint<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AnatomicalStructure<D>, rdfine.RdfResource<D> {
  biomechnicalClass: string | undefined;
  functionalClass: Schema.MedicalEntity<D> | undefined;
  functionalClassLiteral: string | undefined;
  structuralClass: string | undefined;
}

export function JointMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Joint & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class JointClass extends AnatomicalStructureMixin(Resource) {
    @rdfine.property.literal()
    biomechnicalClass: string | undefined;
    @rdfine.property.resource()
    functionalClass: Schema.MedicalEntity | undefined;
    @rdfine.property.literal({ path: schema.functionalClass })
    functionalClassLiteral: string | undefined;
    @rdfine.property.literal()
    structuralClass: string | undefined;
  }
  return JointClass as any
}
JointMixin.appliesTo = schema.Joint
JointMixin.createFactory = (env: RdfineEnvironment) => createFactory<Joint>([AnatomicalStructureMixin, JointMixin], { types: [schema.Joint] }, env)
