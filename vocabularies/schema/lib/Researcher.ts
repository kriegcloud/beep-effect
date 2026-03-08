import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AudienceMixin } from './Audience.js';

export interface Researcher<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Audience<D>, rdfine.RdfResource<D> {
}

export function ResearcherMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Researcher & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ResearcherClass extends AudienceMixin(Resource) {
  }
  return ResearcherClass as any
}
ResearcherMixin.appliesTo = schema.Researcher
ResearcherMixin.createFactory = (env: RdfineEnvironment) => createFactory<Researcher>([AudienceMixin, ResearcherMixin], { types: [schema.Researcher] }, env)
