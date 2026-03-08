import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface Audience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
  audienceType: string | undefined;
  geographicArea: Schema.AdministrativeArea<D> | undefined;
}

export function AudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Audience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AudienceClass extends IntangibleMixin(Resource) {
    @rdfine.property.literal()
    audienceType: string | undefined;
    @rdfine.property.resource()
    geographicArea: Schema.AdministrativeArea | undefined;
  }
  return AudienceClass as any
}
AudienceMixin.appliesTo = schema.Audience
AudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<Audience>([IntangibleMixin, AudienceMixin], { types: [schema.Audience] }, env)
