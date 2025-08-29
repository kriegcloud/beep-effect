# Inferring the rule schema 

```typescript

// use these functions to trigger the attribute type inference
const bool = () => true
const num = () => 1
const str = () => ""
// So we'll need 1 per primitive?
// TODO: what about specific object types? Generics might help there

// The below pattern works for inference. Specifically wrapping 
// stuff in a function named `rule` triggers good type inference
const buttonState = {on: bool()}

interface Rule<T> {
  what: T,
  when?: (arg: T) => boolean,
  then?: (arg: T) => void,
  thenFinally?: () => void
}

// lol just for type inference?
const rule = <T>(r: Rule<T>): Rule<T> => r

rule( {
    what: {
      button: {
        ...buttonState,
        clicked: bool()
      },
    },
    then: a => a.button.clicked
  },
)
```

However, what do we do about facts? Ideally we can do something like:
```typescript
insert("button", "on", true)
```

And get some kind of auto complete?

Or would it be?
```typescript
insert({button: {on: true}})
```

Thats more idiomatic JS, though more verbose. 

The type though needs to be the full list of attributes possible based on all the rules.
I think we could pass in all the rules to a special function (like `edict()`) and key off of 
those? Or would it be `edict<typeof rule1 | typeof rule2 | ...>()` 


### Whoa this kinda works
```typescript

const bool = () => true
const num = () => 1
const str = () => ""

const buttonState = {on: bool()}

interface RuleSet<T> {
  [key: string]: {
    what: T,
    when?: (arg: T) => boolean,
    then?: (arg: T) => void,
    thenFinally?: () => void

  }
}

// lol just for type inference?
const rule = <T>(r: RuleSet<T>): RuleSet<T> => r

rule({
    "clicked": {
      what: {
        button: {
          ...buttonState,
          clicked: bool()
        },
      },
      then: a => a.button
    },
    "not clicked": {
      what: {
        button: {
          blick: bool()
        }
      },
      then: a => a.button.blick
    },
    "bosh": {
      what: {
        foo: {
          bar: num(),
        },
        $char: {
          bloosh: num(),
          blik: str()
        }
      },
    }

  },
)



```

# HA, FOUND IT, Here's the working generic for insert!

```typescript
const bool = () => true
const num = () => 1
const str = () => ""

const buttonState = {on: bool()}
interface Rule<T> {
  what: T,
  when?: (arg: T) => boolean,
  then?: (arg: T) => void,
  thenFinally?: () => void
}
interface RuleSet<T> {
  [key: string]: Rule<T>
}

const rule = <T>(r: RuleSet<T>) => {
  const insert = <Y extends Rule<T>["what"][keyof T]>(fact: {[key: string]: { [K in keyof Y] : Y[K]}} ) => {
    console.log(fact)
  }

  return {r, insert}
}



const x = rule({
    "clicked": {
      what: {
        button: {
          ...buttonState,
          clicked: bool()
        },
      },
      then: a => a.button
    },
    "not clicked": {
      what: {
        button: {
          blick: bool()
        },
        $char: {
          bang: str()
        }
      },
      then: a => a.button.blick
    },
    "bosh": {
      what: {
        foo: {
          bar: num(),
        },
        $char: {
          bloosh: num(),
          bar: num(),
          blik: str()
        }
      },
    }

  },
)

x.insert({"blik": {bar: 12}})
```
