import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { AutomotiveBusinessMixin } from './AutomotiveBusiness.js';

export interface AutoWash<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.AutomotiveBusiness<D>, rdfine.RdfResource<D> {
}

export function AutoWashMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AutoWash & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class AutoWashClass extends AutomotiveBusinessMixin(Resource) {
  }
  return AutoWashClass as any
}
AutoWashMixin.appliesTo = schema.AutoWash
AutoWashMixin.createFactory = (env: RdfineEnvironment) => createFactory<AutoWash>([AutomotiveBusinessMixin, AutoWashMixin], { types: [schema.AutoWash] }, env)
