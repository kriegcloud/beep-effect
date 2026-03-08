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
import { TargetMixin } from './Target.js';

export interface SPARQLTarget<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.SPARQLAskExecutable<D>, Sh.SPARQLSelectExecutable<D>, Sh.Target<D>, rdfine.RdfResource<D> {
}

export function SPARQLTargetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLTarget & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLTargetClass extends TargetMixin(SPARQLSelectExecutableMixin(SPARQLAskExecutableMixin(Resource))) {
  }
  return SPARQLTargetClass as any
}
SPARQLTargetMixin.appliesTo = sh.SPARQLTarget
SPARQLTargetMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLTarget>([TargetMixin, SPARQLSelectExecutableMixin, SPARQLAskExecutableMixin, SPARQLTargetMixin], { types: [sh.SPARQLTarget] }, env)
