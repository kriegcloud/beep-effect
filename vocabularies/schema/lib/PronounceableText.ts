import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';

export interface PronounceableText<D extends RDF.DatasetCore = RDF.DatasetCore> extends rdfine.RdfResource<D> {
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  phoneticText: string | undefined;
  speechToTextMarkup: string | undefined;
  textValue: string | undefined;
}

export function PronounceableTextMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<PronounceableText & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class PronounceableTextClass extends Resource {
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.literal()
    phoneticText: string | undefined;
    @rdfine.property.literal()
    speechToTextMarkup: string | undefined;
    @rdfine.property.literal()
    textValue: string | undefined;
  }
  return PronounceableTextClass as any
}
PronounceableTextMixin.appliesTo = schema.PronounceableText
PronounceableTextMixin.createFactory = (env: RdfineEnvironment) => createFactory<PronounceableText>([PronounceableTextMixin], { types: [schema.PronounceableText] }, env)
