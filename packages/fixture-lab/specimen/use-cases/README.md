# @beep/fixture-lab-specimen-use-cases

Synthetic command/query package for the `fixture-lab/Specimen` architecture automation slice.

The package root is a browser-safe alias for `/public`.

Exports:

- `@beep/fixture-lab-specimen-use-cases`
- `@beep/fixture-lab-specimen-use-cases/public`
- `@beep/fixture-lab-specimen-use-cases/server`
- `@beep/fixture-lab-specimen-use-cases/test`

`/public` owns commands, queries, public application errors, and the client-safe
facade contract. `/server` adds repository ports and the use-case constructor.
