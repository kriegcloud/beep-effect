import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { IntangibleMixin } from './Intangible.js';

export interface ComputerLanguage<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Intangible<D>, rdfine.RdfResource<D> {
}

export function ComputerLanguageMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ComputerLanguage & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ComputerLanguageClass extends IntangibleMixin(Resource) {
  }
  return ComputerLanguageClass as any
}
ComputerLanguageMixin.appliesTo = schema.ComputerLanguage
ComputerLanguageMixin.createFactory = (env: RdfineEnvironment) => createFactory<ComputerLanguage>([IntangibleMixin, ComputerLanguageMixin], { types: [schema.ComputerLanguage] }, env)
