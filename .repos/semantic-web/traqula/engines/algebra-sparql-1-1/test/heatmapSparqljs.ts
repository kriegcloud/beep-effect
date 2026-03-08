import { translate } from 'sparqlalgebrajs';
import { Parser } from 'sparqljs';
import { queryLargeObjectList } from './heatmap.js';

if (false) {
  const sparqlJs = new Parser();
  const ast = sparqlJs.parse(queryLargeObjectList);

  for (let i = 0; i < 10000; i++) {
    translate(ast, { quads: true });
  }
}
