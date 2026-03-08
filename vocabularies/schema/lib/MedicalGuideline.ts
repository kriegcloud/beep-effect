import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { MedicalEntityMixin } from './MedicalEntity.js';

export interface MedicalGuideline<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.MedicalEntity<D>, rdfine.RdfResource<D> {
  evidenceLevel: Schema.MedicalEvidenceLevel | undefined;
  evidenceOrigin: string | undefined;
  guidelineDate: Date | undefined;
  guidelineSubject: Schema.MedicalEntity<D> | undefined;
}

export function MedicalGuidelineMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalGuideline & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalGuidelineClass extends MedicalEntityMixin(Resource) {
    @rdfine.property()
    evidenceLevel: Schema.MedicalEvidenceLevel | undefined;
    @rdfine.property.literal()
    evidenceOrigin: string | undefined;
    @rdfine.property.literal({ type: Date, datatype: $rdf.namedNode('http://www.w3.org/2001/XMLSchema#date') })
    guidelineDate: Date | undefined;
    @rdfine.property.resource()
    guidelineSubject: Schema.MedicalEntity | undefined;
  }
  return MedicalGuidelineClass as any
}
MedicalGuidelineMixin.appliesTo = schema.MedicalGuideline
MedicalGuidelineMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalGuideline>([MedicalEntityMixin, MedicalGuidelineMixin], { types: [schema.MedicalGuideline] }, env)
