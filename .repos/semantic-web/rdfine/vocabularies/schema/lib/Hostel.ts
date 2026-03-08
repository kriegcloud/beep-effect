import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LodgingBusinessMixin } from './LodgingBusiness.js';

export interface Hostel<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LodgingBusiness<D>, rdfine.RdfResource<D> {
}

export function HostelMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Hostel & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class HostelClass extends LodgingBusinessMixin(Resource) {
  }
  return HostelClass as any
}
HostelMixin.appliesTo = schema.Hostel
HostelMixin.createFactory = (env: RdfineEnvironment) => createFactory<Hostel>([LodgingBusinessMixin, HostelMixin], { types: [schema.Hostel] }, env)
