import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LegalServiceMixin } from './LegalService.js';

export interface Attorney<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LegalService<D>, rdfine.RdfResource<D> {
}

export function AttorneyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Attorney & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AttorneyClass extends LegalServiceMixin(Resource) {
  }
  return AttorneyClass as any
}
AttorneyMixin.appliesTo = schema.Attorney
AttorneyMixin.createFactory = (env: RdfineEnvironment) => createFactory<Attorney>([LegalServiceMixin, AttorneyMixin], { types: [schema.Attorney] }, env)
