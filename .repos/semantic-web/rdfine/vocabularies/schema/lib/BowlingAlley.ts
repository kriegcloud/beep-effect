import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { SportsActivityLocationMixin } from './SportsActivityLocation.js';

export interface BowlingAlley<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.SportsActivityLocation<D>, rdfine.RdfResource<D> {
}

export function BowlingAlleyMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<BowlingAlley & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class BowlingAlleyClass extends SportsActivityLocationMixin(Resource) {
  }
  return BowlingAlleyClass as any
}
BowlingAlleyMixin.appliesTo = schema.BowlingAlley
BowlingAlleyMixin.createFactory = (env: RdfineEnvironment) => createFactory<BowlingAlley>([SportsActivityLocationMixin, BowlingAlleyMixin], { types: [schema.BowlingAlley] }, env)
