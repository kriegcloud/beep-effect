import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { InteractActionMixin } from './InteractAction.js';

export interface CommunicateAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.InteractAction<D>, rdfine.RdfResource<D> {
  about: Schema.Thing<D> | undefined;
  inLanguage: Schema.Language<D> | undefined;
  inLanguageLiteral: string | undefined;
  language: Schema.Language<D> | undefined;
  recipient: Schema.Audience<D> | Schema.ContactPoint<D> | Schema.Organization<D> | Schema.Person<D> | undefined;
}

export function CommunicateActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CommunicateAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class CommunicateActionClass extends InteractActionMixin(Resource) {
    @rdfine.property.resource()
    about: Schema.Thing | undefined;
    @rdfine.property.resource()
    inLanguage: Schema.Language | undefined;
    @rdfine.property.literal({ path: schema.inLanguage })
    inLanguageLiteral: string | undefined;
    @rdfine.property.resource()
    language: Schema.Language | undefined;
    @rdfine.property.resource()
    recipient: Schema.Audience | Schema.ContactPoint | Schema.Organization | Schema.Person | undefined;
  }
  return CommunicateActionClass as any
}
CommunicateActionMixin.appliesTo = schema.CommunicateAction
CommunicateActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<CommunicateAction>([InteractActionMixin, CommunicateActionMixin], { types: [schema.CommunicateAction] }, env)
