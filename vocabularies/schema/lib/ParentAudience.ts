import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PeopleAudienceMixin } from './PeopleAudience.js';

export interface ParentAudience<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.PeopleAudience<D>, rdfine.RdfResource<D> {
  childMaxAge: number | undefined;
  childMinAge: number | undefined;
}

export function ParentAudienceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ParentAudience & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ParentAudienceClass extends PeopleAudienceMixin(Resource) {
    @rdfine.property.literal({ type: Number })
    childMaxAge: number | undefined;
    @rdfine.property.literal({ type: Number })
    childMinAge: number | undefined;
  }
  return ParentAudienceClass as any
}
ParentAudienceMixin.appliesTo = schema.ParentAudience
ParentAudienceMixin.createFactory = (env: RdfineEnvironment) => createFactory<ParentAudience>([PeopleAudienceMixin, ParentAudienceMixin], { types: [schema.ParentAudience] }, env)
