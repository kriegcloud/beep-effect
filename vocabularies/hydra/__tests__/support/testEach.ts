/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 *
 * This is a helper function, that parses a markdown table via a tagged template literal
 * and returns a function needing a callback to be passed; with which it is invoked
 * for each row of the table with the values filled in with the columnHeaderName
 *
 * @param tableMarkup
 * @param substitutions
 */
export function testEach(tableMarkup: TemplateStringsArray, ...substitutions: any[]): (callback: Function) => void {
  const headerMarkup = tableMarkup[0];

  // filter all table headers by splitting with '|' on initial and removing everything empty after having stuff trimmed
  const keys = headerMarkup.split('|')
    .map(cellContent => cellContent.trim())
    .filter(trimmedContent => trimmedContent !== '')
    .filter(trimmedContent => trimmedContent !== '\n')
    .filter(trimmedContent => !trimmedContent.startsWith('-'));

  // determine rowCount and offset index by rowCount
  const rowCount = substitutions.length / keys.length;
  const columnCount = keys.length;

  return (callback) => {
    // invoke callback for each row
    const rows = Array.from({ length: rowCount });

    let returnPromise = false;
    // the result of each callback might either be a promise or not
    // if it is promise, wait until it resolves
    return rows.reduce((acc, current, row) => {
      // create obj for current row
      const obj = keys.reduce((acc, key, index) => {
        // and shift through substitutions by rowOffset
        acc[key] = substitutions[index + row * columnCount];
        return acc;
      }, <Record<string, unknown>>{});

      // determine, whether we need to return a promise...
      const result = callback(obj, row);
      if (row === 0 && result instanceof Promise) {
        returnPromise = true;
        acc = result;
      }

      // if we are to return a promise, we need to sequentially execute them
      // by deferring their call to then handler of the previous one
      if (returnPromise) {
        // @ts-ignore because TS does not know, that we are dynamically changing the type
        return acc.then(() => {
          return result
        });
      } else {
        return acc;
      }
    }, undefined);
  };
}
