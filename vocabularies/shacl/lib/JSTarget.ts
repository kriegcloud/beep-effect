import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { JSExecutableMixin } from './JSExecutable.js';
import { TargetMixin } from './Target.js';

export interface JSTarget<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.JSExecutable<D>, Sh.Target<D>, rdfine.RdfResource<D> {
}

export function JSTargetMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSTarget & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSTargetClass extends TargetMixin(JSExecutableMixin(Resource)) {
  }
  return JSTargetClass as any
}
JSTargetMixin.appliesTo = sh.JSTarget
JSTargetMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSTarget>([TargetMixin, JSExecutableMixin, JSTargetMixin], { types: [sh.JSTarget] }, env)
