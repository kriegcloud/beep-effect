import type { Mixin } from '@tpluscode/rdfine/lib/ResourceFactory';
import { CreativeWorkMixin } from '../lib/CreativeWork.js';
import { MathSolverMixin } from '../lib/MathSolver.js';
import { SolveMathActionMixin } from '../lib/SolveMathAction.js';

export const MathSolverBundle = [
  CreativeWorkMixin as Mixin,
  MathSolverMixin as Mixin,
  SolveMathActionMixin as Mixin];
