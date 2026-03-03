import { parse } from '../src/parse.js'
import type { RootResult } from '../src/result/RootResult.js'

interface BaseFuzzingRule {
  getString: () => string
  weight: number
}

type NonClosingFuzzingRule = BaseFuzzingRule & {
  shouldClose: false
}

type ClosingFuzzingRule = BaseFuzzingRule & {
  shouldClose: true
  getClosing: () => string
}

type FuzzingRule = NonClosingFuzzingRule | ClosingFuzzingRule

const STRING_LENGTH = 8

function randomInt (ceil: number): number {
  return Math.floor(Math.random() * ceil)
}

function choose<T> (arr: T[]): T {
  return arr[randomInt(arr.length)]
}

function makeFixedRule (weight: number, open: string, close?: string): FuzzingRule {
  if (close === undefined) {
    return {
      getString: () => ` ${open} `,
      shouldClose: false,
      weight
    }
  } else {
    return {
      getString: () => ` ${open} `,
      shouldClose: true,
      getClosing: () => ` ${close} `,
      weight
    }
  }
}

function createCharRange (start: string, end: string): string[] {
  const startNumber = start.charCodeAt(0)
  const endNumber = end.charCodeAt(0)
  return [...Array(endNumber - startNumber + 1) as undefined[]]
    .map((el, index) => String.fromCharCode(index + startNumber))
}

const identifierStart = [...createCharRange('a', 'z'), ...createCharRange('A', 'Z')]
const identifierContinue = [...identifierStart, '-', '_', ...createCharRange('0', '9')]
const makeIdentifierRule = (weight: number): NonClosingFuzzingRule => ({
  getString: () => {
    let result = choose(identifierStart)
    for (let i = 1; i < STRING_LENGTH; i++) {
      result += choose(identifierContinue)
    }
    return ` ${result} `
  },
  shouldClose: false,
  weight
})

function randomChar (): string {
  return String.fromCharCode(randomInt(65535))
}

const makeStringValueRule = (weight: number): NonClosingFuzzingRule => ({
  getString: () => {
    let result = ''
    for (let i = 2; i < STRING_LENGTH; i++) {
      result += randomChar()
    }
    const escape = choose(['\'', '"'])
    return ` ${escape}${result}${escape} `
  },
  shouldClose: false,
  weight
})

const numberChars = createCharRange('0', '9')
const makeNumberRule = (weight: number): NonClosingFuzzingRule => ({
  getString: () => {
    let result = ''
    for (let i = 0; i < STRING_LENGTH; i++) {
      result += choose(numberChars)
    }
    return ` ${result} `
  },
  shouldClose: false,
  weight
})

const rules: FuzzingRule[] = [
  makeFixedRule(10, '(', ')'),
  makeFixedRule(10, '{', '}'),
  makeFixedRule(10, '[', ']'),
  makeFixedRule(10, '|'),
  makeFixedRule(10, '<', '>'),
  makeFixedRule(10, '=>'),
  makeFixedRule(10, ','),
  makeFixedRule(10, '*'),
  makeFixedRule(10, '?'),
  makeFixedRule(10, '!'),
  makeFixedRule(10, '='),
  makeFixedRule(10, ':'),
  makeFixedRule(10, '...'),
  makeFixedRule(10, '.'),
  // makeFixedRule(10, '#'),
  // makeFixedRule(10, '~'),
  // makeFixedRule(10, '/'),
  // makeFixedRule(10, '@'),
  makeFixedRule(10, 'undefined'),
  makeFixedRule(10, 'null'),
  makeFixedRule(10, 'void'),
  makeFixedRule(10, 'function'),
  makeFixedRule(10, 'this'),
  makeFixedRule(10, 'new'),
  makeFixedRule(10, 'module'),
  makeFixedRule(10, 'typeof'),
  makeFixedRule(10, 'keyof'),
  makeFixedRule(10, 'import'),
  makeIdentifierRule(300),
  makeStringValueRule(10),
  makeNumberRule(10)
]

const summedRulesWeight = rules
  .map(rule => rule.weight)
  .reduce((sum, next) => sum + next)

function chooseWeighted (): FuzzingRule {
  let value = randomInt(summedRulesWeight)
  let found: FuzzingRule = rules[0]
  for (const rule of rules) {
    if (value < rule.weight) {
      found = rule
      break
    }
    value -= rule.weight
  }
  return found
}

export function fuzz (length: number, closingP = 0.3): string {
  const shouldClose: ClosingFuzzingRule[] = []
  let result = ''
  for (let i = 0; i < length; i++) {
    if (Math.random() < closingP) {
      const next = shouldClose.pop()
      if (next !== undefined) {
        result += next.getClosing()
        continue
      }
    }
    const nextRule = chooseWeighted()
    result += nextRule.getString()
    if (nextRule.shouldClose) {
      shouldClose.push(nextRule)
    }
  }
  return result
}

if (process.argv.length !== 3) {
  // eslint-disable-next-line no-console -- Testing
  console.error('How many fuzzes do you want?')
  process.exit(1)
}

interface Result {
  fuzzed?: string,
  parsed?: RootResult,
  error?: string,
  valid?: number,
  invalid?: number
}

const results: Result[] = []

while (results.length < parseInt(process.argv[2], 10)) {
  const result: Result = {}
  try {
    result.fuzzed = fuzz(4)
    result.parsed = parse(result.fuzzed, 'typescript')
  } catch (e) {
    result.error = (e as Error).message
  }
  results.push(result)
}

const valid = results.filter(r => r.parsed !== undefined).length

results.push({
  valid,
  invalid: results.length - valid
})

// eslint-disable-next-line no-console -- Testing
console.log(JSON.stringify(results, null, 2))
