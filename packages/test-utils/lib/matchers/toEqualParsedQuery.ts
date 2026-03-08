import { expect } from 'vitest';

expect.extend({
  toEqualParsedQuery(received: unknown, expected: unknown) {
    const pass = objectsEqual(received, expected, () => false, []);
    const message = pass ?
        () =>
          `${this.utils.matcherHint('toEqualParsedQuery')
        }\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(received)}` :
        () => {
          const diffString = this.utils.diff(expected, received, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('toEqualParsedQuery')
          }\n\n${
          diffString && diffString.includes('- Expect') ?
            `Difference:\n\n${diffString}` :
            `Expected: ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}`}`
          );
        };

    return { pass, message };
  },
  toEqualParsedQueryIgnoring(
    received: unknown,
    selector: (obj: object) => boolean,
    ignoreKeys: string[],
    expected: unknown,
  ) {
    const pass = objectsEqual(received, expected, selector, ignoreKeys);
    const message = pass ?
        () =>
        `${this.utils.matcherHint('toEqualParsedQuery')
        }\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(received)}` :
        () => {
          const diffString = this.utils.diff(expected, received, {
            expand: this.expand,
          });
          return (
          `${this.utils.matcherHint('toEqualParsedQuery')
          }\n\n${
            diffString && diffString.includes('- Expect') ?
              `Difference:\n\n${diffString}` :
              `Expected: ${this.utils.printExpected(expected)}\n` +
              `Received: ${this.utils.printReceived(received)}`}`
          );
        };

    return { pass, message };
  },
});

// We cannot use native instanceOf to test whether expected is a Term!
function objectsEqual(
  received: unknown,
  expected: unknown,
  selector: (obj: object) => boolean,
  ignoreKeys: string[],
): boolean {
  if (received === undefined || received === null || isPrimitive(received)) {
    return received === expected;
  }

  if (isTerm(received)) {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error TS2345
    return received.equals(expected);
  }
  if (isTerm(expected)) {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error TS2345
    return expected.equals(received);
  }
  //  York
  // test
  if (Array.isArray(received)) {
    if (!Array.isArray(expected)) {
      return false;
    }
    if (received.length !== expected.length) {
      return false;
    }
    for (const [ i, element ] of received.entries()) {
      if (!objectsEqual(element, expected[i], selector, ignoreKeys)) {
        return false;
      }
    }
  } else {
    // Received == object
    if (expected === undefined || expected === null || isPrimitive(expected) || Array.isArray(expected)) {
      return false;
    }
    const keys_first = Object.keys(received);
    const receivedMatches = selector(received);

    for (const key of keys_first) {
      if (receivedMatches && ignoreKeys.includes(key)) {
        continue;
      }
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error TS7053
      if (!objectsEqual(received[key], expected[key], selector, ignoreKeys)) {
        return false;
      }
    }

    // We do this to make sure that we are not missing keys in the received object
    const keys_second = Object.keys(expected);
    for (const key of keys_second) {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error TS7053
      if (!objectsEqual(received[key], expected[key], selector, ignoreKeys)) {
        return false;
      }
    }
  }
  return true;
}

// If true, the value is a term. With ts annotation
function isTerm(value: unknown): value is { equals: (other: { termType: unknown } | undefined | null) => boolean } {
  return false;
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
