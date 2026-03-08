import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import type * as Rdfs from '@rdfine/rdfs';
import { ResourceMixin as RdfsResourceMixin } from '@rdfine/rdfs/lib/Resource';

export interface AbstractResult<D extends RDF.DatasetCore = RDF.DatasetCore> extends Rdfs.Resource<D>, rdfine.RdfResource<D> {
  detail: Array<Sh.AbstractResult<D>>;
  focusNode: RDF.Term | undefined;
  resultMessage: string | undefined;
  resultPath: Rdfs.Resource<D> | undefined;
  resultSeverity: Sh.Severity<D> | undefined;
  sourceConstraint: RDF.Term | undefined;
  sourceConstraintComponent: Sh.ConstraintComponent<D> | undefined;
  sourceShape: Sh.Shape<D> | undefined;
  value: RDF.Term | undefined;
}

export function AbstractResultMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<AbstractResult & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class AbstractResultClass extends RdfsResourceMixin(Resource) {
    @rdfine.property.resource({ values: 'array', as: [AbstractResultMixin] })
    detail!: Array<Sh.AbstractResult>;
    @rdfine.property()
    focusNode: RDF.Term | undefined;
    @rdfine.property.literal()
    resultMessage: string | undefined;
    @rdfine.property.resource({ as: [RdfsResourceMixin] })
    resultPath: Rdfs.Resource | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Severity] })
    resultSeverity: Sh.Severity | undefined;
    @rdfine.property()
    sourceConstraint: RDF.Term | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.ConstraintComponent] })
    sourceConstraintComponent: Sh.ConstraintComponent | undefined;
    @rdfine.property.resource({ implicitTypes: [sh.Shape] })
    sourceShape: Sh.Shape | undefined;
    @rdfine.property()
    value: RDF.Term | undefined;
  }
  return AbstractResultClass as any
}
AbstractResultMixin.appliesTo = sh.AbstractResult
AbstractResultMixin.createFactory = (env: RdfineEnvironment) => createFactory<AbstractResult>([RdfsResourceMixin, AbstractResultMixin], { types: [sh.AbstractResult] }, env)
