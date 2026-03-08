import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ServiceMixin } from './Service.js';

export interface GovernmentService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Service<D>, rdfine.RdfResource<D> {
  jurisdiction: Schema.AdministrativeArea<D> | undefined;
  jurisdictionLiteral: string | undefined;
  serviceOperator: Schema.Organization<D> | undefined;
}

export function GovernmentServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<GovernmentService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class GovernmentServiceClass extends ServiceMixin(Resource) {
    @rdfine.property.resource()
    jurisdiction: Schema.AdministrativeArea | undefined;
    @rdfine.property.literal({ path: schema.jurisdiction })
    jurisdictionLiteral: string | undefined;
    @rdfine.property.resource()
    serviceOperator: Schema.Organization | undefined;
  }
  return GovernmentServiceClass as any
}
GovernmentServiceMixin.appliesTo = schema.GovernmentService
GovernmentServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<GovernmentService>([ServiceMixin, GovernmentServiceMixin], { types: [schema.GovernmentService] }, env)
