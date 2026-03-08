import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface ProfessionalService<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function ProfessionalServiceMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ProfessionalService & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ProfessionalServiceClass extends LocalBusinessMixin(Resource) {
  }
  return ProfessionalServiceClass as any
}
ProfessionalServiceMixin.appliesTo = schema.ProfessionalService
ProfessionalServiceMixin.createFactory = (env: RdfineEnvironment) => createFactory<ProfessionalService>([LocalBusinessMixin, ProfessionalServiceMixin], { types: [schema.ProfessionalService] }, env)
