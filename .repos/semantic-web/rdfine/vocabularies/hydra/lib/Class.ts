import '../extensions/rdfs/Class.js';
import { ClassMixinEx } from '../extensions/rdfs/Class.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { hydra } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Hydra from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ClassMixin as RdfsClassMixin } from '@rdfine/rdfs/lib/Class';

export interface Class<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Class<D>, rdfine.RdfResource<D> {
  description: string | undefined;
  supportedOperation: Array<Hydra.Operation<D>>;
  title: string | undefined;
}

export function ClassMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Class & RdfResourceCore> & Base {
  @rdfine.namespace(hydra)
  class ClassClass extends ClassMixinEx(RdfsClassMixin(Resource)) {
    @rdfine.property.literal()
    description: string | undefined;
    @rdfine.property.resource({ values: 'array', implicitTypes: [hydra.Operation] })
    supportedOperation!: Array<Hydra.Operation>;
    @rdfine.property.literal()
    title: string | undefined;
  }
  return ClassClass as any
}
ClassMixin.appliesTo = hydra.Class
ClassMixin.createFactory = (env: RdfineEnvironment) => createFactory<Class>([RdfsClassMixin, ClassMixin], { types: [hydra.Class] }, env)
