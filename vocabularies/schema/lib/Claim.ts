import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface Claim<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  appearance: Schema.CreativeWork<D> | undefined;
  claimInterpreter: Schema.Organization<D> | Schema.Person<D> | undefined;
  firstAppearance: Schema.CreativeWork<D> | undefined;
}

export function ClaimMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Claim & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class ClaimClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    appearance: Schema.CreativeWork | undefined;
    @rdfine.property.resource()
    claimInterpreter: Schema.Organization | Schema.Person | undefined;
    @rdfine.property.resource()
    firstAppearance: Schema.CreativeWork | undefined;
  }
  return ClaimClass as any
}
ClaimMixin.appliesTo = schema.Claim
ClaimMixin.createFactory = (env: RdfineEnvironment) => createFactory<Claim>([CreativeWorkMixin, ClaimMixin], { types: [schema.Claim] }, env)
