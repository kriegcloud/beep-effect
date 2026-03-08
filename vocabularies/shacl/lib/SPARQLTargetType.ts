import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { SPARQLAskExecutableMixin } from './SPARQLAskExecutable.js';
import { SPARQLSelectExecutableMixin } from './SPARQLSelectExecutable.js';
import { TargetTypeMixin } from './TargetType.js';

export interface SPARQLTargetType<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLAskExecutable<D>, Sh.SPARQLSelectExecutable<D>, Sh.TargetType<D>, rdfine.RdfResource<D> {
}

export function SPARQLTargetTypeMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLTargetType & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLTargetTypeClass extends TargetTypeMixin(SPARQLSelectExecutableMixin(SPARQLAskExecutableMixin(Resource))) {
  }
  return SPARQLTargetTypeClass as any
}
SPARQLTargetTypeMixin.appliesTo = sh.SPARQLTargetType
SPARQLTargetTypeMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLTargetType>([TargetTypeMixin, SPARQLSelectExecutableMixin, SPARQLAskExecutableMixin, SPARQLTargetTypeMixin], { types: [sh.SPARQLTargetType] }, env)
