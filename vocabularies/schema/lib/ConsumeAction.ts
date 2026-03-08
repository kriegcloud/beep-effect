import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { ActionMixin } from './Action.js';

export interface ConsumeAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.Action<D>, rdfine.RdfResource<D> {
  actionAccessibilityRequirement: Schema.ActionAccessSpecification<D> | undefined;
  expectsAcceptanceOf: Schema.Offer<D> | undefined;
}

export function ConsumeActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ConsumeAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ConsumeActionClass extends ActionMixin(Resource) {
    @rdfine.property.resource()
    actionAccessibilityRequirement: Schema.ActionAccessSpecification | undefined;
    @rdfine.property.resource()
    expectsAcceptanceOf: Schema.Offer | undefined;
  }
  return ConsumeActionClass as any
}
ConsumeActionMixin.appliesTo = schema.ConsumeAction
ConsumeActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ConsumeAction>([ActionMixin, ConsumeActionMixin], { types: [schema.ConsumeAction] }, env)
