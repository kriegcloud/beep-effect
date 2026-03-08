import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface AnatomicalSystem<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  associatedPathophysiology: string | undefined;
  comprisedOf: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | undefined;
  relatedCondition: Schema.MedicalCondition<D> | undefined;
  relatedStructure: Schema.AnatomicalStructure<D> | undefined;
  relatedTherapy: Schema.MedicalTherapy<D> | undefined;
}

export function AnatomicalSystemMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AnatomicalSystem & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AnatomicalSystemClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.literal()
    associatedPathophysiology: string | undefined;
    @rdfine.property.resource()
    comprisedOf: Schema.AnatomicalStructure | Schema.AnatomicalSystem | undefined;
    @rdfine.property.resource()
    relatedCondition: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    relatedStructure: Schema.AnatomicalStructure | undefined;
    @rdfine.property.resource()
    relatedTherapy: Schema.MedicalTherapy | undefined;
  }
  return AnatomicalSystemClass as any
}
AnatomicalSystemMixin.appliesTo = schema.AnatomicalSystem
AnatomicalSystemMixin.createFactory = (env: RdfineEnvironment) => createFactory<AnatomicalSystem>([MedicalEntityMixin, AnatomicalSystemMixin], { types: [schema.AnatomicalSystem] }, env)
