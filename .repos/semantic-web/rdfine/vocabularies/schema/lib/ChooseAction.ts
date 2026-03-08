import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AssessActionMixin } from './AssessAction.js';

export interface ChooseAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AssessAction<D>, rdfine.RdfResource<D> {
  actionOption: Schema.Thing<D> | undefined;
  actionOptionLiteral: string | undefined;
  option: Schema.Thing<D> | undefined;
  optionLiteral: string | undefined;
}

export function ChooseActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChooseAction & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ChooseActionClass extends AssessActionMixin(Resource) {
    @rdfine.property.resource()
    actionOption: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.actionOption })
    actionOptionLiteral: string | undefined;
    @rdfine.property.resource()
    option: Schema.Thing | undefined;
    @rdfine.property.literal({ path: schema.option })
    optionLiteral: string | undefined;
  }
  return ChooseActionClass as any
}
ChooseActionMixin.appliesTo = schema.ChooseAction
ChooseActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChooseAction>([AssessActionMixin, ChooseActionMixin], { types: [schema.ChooseAction] }, env)
