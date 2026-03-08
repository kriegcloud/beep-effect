import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface SuperficialAnatomy<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  associatedPathophysiology: string | undefined;
  relatedAnatomy: Schema.AnatomicalStructure<D> | Schema.AnatomicalSystem<D> | undefined;
  relatedCondition: Schema.MedicalCondition<D> | undefined;
  relatedTherapy: Schema.MedicalTherapy<D> | undefined;
  significance: string | undefined;
}

export function SuperficialAnatomyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SuperficialAnatomy & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SuperficialAnatomyClass extends MedicalEntityMixin(Resource) {
    @rdfine.property.literal()
    associatedPathophysiology: string | undefined;
    @rdfine.property.resource()
    relatedAnatomy: Schema.AnatomicalStructure | Schema.AnatomicalSystem | undefined;
    @rdfine.property.resource()
    relatedCondition: Schema.MedicalCondition | undefined;
    @rdfine.property.resource()
    relatedTherapy: Schema.MedicalTherapy | undefined;
    @rdfine.property.literal()
    significance: string | undefined;
  }
  return SuperficialAnatomyClass as any
}
SuperficialAnatomyMixin.appliesTo = schema.SuperficialAnatomy
SuperficialAnatomyMixin.createFactory = (env: RdfineEnvironment) => createFactory<SuperficialAnatomy>([MedicalEntityMixin, SuperficialAnatomyMixin], { types: [schema.SuperficialAnatomy] }, env)
