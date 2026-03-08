import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { LocalBusinessMixin } from './LocalBusiness.js';

export interface SportsActivityLocation<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.LocalBusiness<D>, rdfine.RdfResource<D> {
}

export function SportsActivityLocationMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SportsActivityLocation & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class SportsActivityLocationClass extends LocalBusinessMixin(Resource) {
  }
  return SportsActivityLocationClass as any
}
SportsActivityLocationMixin.appliesTo = schema.SportsActivityLocation
SportsActivityLocationMixin.createFactory = (env: RdfineEnvironment) => createFactory<SportsActivityLocation>([LocalBusinessMixin, SportsActivityLocationMixin], { types: [schema.SportsActivityLocation] }, env)
