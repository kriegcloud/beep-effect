import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudienceMixin } from './Audience.js';
import { PeopleAudienceMixin } from './PeopleAudience.js';

export interface MedicalAudience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Audience<D>, Schema.PeopleAudience<D>, rdfine.RdfResource<D> {
}

export function MedicalAudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MedicalAudience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MedicalAudienceClass extends PeopleAudienceMixin(AudienceMixin(Resource)) {
  }
  return MedicalAudienceClass as any
}
MedicalAudienceMixin.appliesTo = schema.MedicalAudience
MedicalAudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<MedicalAudience>([PeopleAudienceMixin, AudienceMixin, MedicalAudienceMixin], { types: [schema.MedicalAudience] }, env)
