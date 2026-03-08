import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudienceMixin } from './Audience.js';

export interface EducationalAudience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Audience<D>, rdfine.RdfResource<D> {
  educationalRole: string | undefined;
}

export function EducationalAudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<EducationalAudience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class EducationalAudienceClass extends AudienceMixin(Resource) {
    @rdfine.property.literal()
    educationalRole: string | undefined;
  }
  return EducationalAudienceClass as any
}
EducationalAudienceMixin.appliesTo = schema.EducationalAudience
EducationalAudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<EducationalAudience>([AudienceMixin, EducationalAudienceMixin], { types: [schema.EducationalAudience] }, env)
