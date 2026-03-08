import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreateActionMixin } from './CreateAction.js';

export interface WriteAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreateAction<D>, rdfine.RdfResource<D> {
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  language: Schema.Language<D> | undefined;
}

export function WriteActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<WriteAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class WriteActionClass extends CreateActionMixin(Resource) {
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    language: Schema.Language | undefined;
  }
  return WriteActionClass as any
}
WriteActionMixin.appliesTo = schema.WriteAction
WriteActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<WriteAction>([CreateActionMixin, WriteActionMixin], { types: [schema.WriteAction] }, env)
