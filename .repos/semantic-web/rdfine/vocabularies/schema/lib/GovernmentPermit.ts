import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { PermitMixin } from './Permit.js';

export interface GovernmentPermit<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Permit<D>, rdfine.RdfResource<D> {
}

export function GovernmentPermitMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GovernmentPermit & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GovernmentPermitClass extends PermitMixin(Resource) {
  }
  return GovernmentPermitClass as any
}
GovernmentPermitMixin.appliesTo = schema.GovernmentPermit
GovernmentPermitMixin.createFactory = (env: RdfineEnvironment) => createFactory<GovernmentPermit>([PermitMixin, GovernmentPermitMixin], { types: [schema.GovernmentPermit] }, env)
