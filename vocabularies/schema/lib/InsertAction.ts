import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AddActionMixin } from './AddAction.js';

export interface InsertAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AddAction<D>, rdfine.RdfResource<D> {
  toLocation: Schema.Place<D> | undefined;
}

export function InsertActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<InsertAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class InsertActionClass extends AddActionMixin(Resource) {
    @rdfine.property.resource()
    toLocation: Schema.Place | undefined;
  }
  return InsertActionClass as any
}
InsertActionMixin.appliesTo = schema.InsertAction
InsertActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<InsertAction>([AddActionMixin, InsertActionMixin], { types: [schema.InsertAction] }, env)
