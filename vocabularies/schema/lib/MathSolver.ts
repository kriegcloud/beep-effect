import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { schema } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Schema from '../index.js';
import { CreativeWorkMixin } from './CreativeWork.js';

export interface MathSolver<D extends RDF.DatasetCore = RDF.DatasetCore> extends Schema.CreativeWork<D>, rdfine.RdfResource<D> {
  mathExpression: Schema.SolveMathAction<D> | undefined;
  mathExpressionLiteral: string | undefined;
}

export function MathSolverMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<MathSolver & RdfResourceCore> & Base {
  @rdfine.namespace(schema)
  class MathSolverClass extends CreativeWorkMixin(Resource) {
    @rdfine.property.resource()
    mathExpression: Schema.SolveMathAction | undefined;
    @rdfine.property.literal({ path: schema.mathExpression })
    mathExpressionLiteral: string | undefined;
  }
  return MathSolverClass as any
}
MathSolverMixin.appliesTo = schema.MathSolver
MathSolverMixin.createFactory = (env: RdfineEnvironment) => createFactory<MathSolver>([CreativeWorkMixin, MathSolverMixin], { types: [schema.MathSolver] }, env)
