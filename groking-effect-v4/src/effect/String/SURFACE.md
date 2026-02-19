# effect/String Surface

Total exports: 63

| Export | Kind | Overview |
|---|---|---|
| `at` | `const` | A `pipe`-able version of the native `charAt` method. |
| `camelCase` | `const` | Converts a string to camelCase. |
| `camelToSnake` | `const` | Converts a camelCase string to snake_case. |
| `capitalize` | `const` | Capitalizes the first character of a string. |
| `charAt` | `const` | Returns the character at the specified index, or `None` if the index is out of bounds. |
| `charCodeAt` | `const` | Returns the character code at the specified index, or `undefined` if the index is out of bounds. |
| `codePointAt` | `const` | A `pipe`-able version of the native `codePointAt` method. |
| `concat` | `const` | Concatenates two strings at runtime. |
| `Concat` | `type` | Concatenates two strings at the type level. |
| `constantCase` | `const` | Converts a string to CONSTANT_CASE (uppercase with underscores). |
| `empty` | `const` | The empty string `""`. |
| `endsWith` | `const` | Returns `true` if the string ends with the specified search string. |
| `Equivalence` | `const` | An `Equivalence` instance for strings using strict equality (`===`). |
| `includes` | `const` | Returns `true` if `searchString` appears as a substring of `self`, at one or more positions that are greater than or equal to `position`; otherwise, returns `false`. |
| `indexOf` | `const` | Returns the index of the first occurrence of a substring, or `None` if not found. |
| `isEmpty` | `const` | Test whether a `string` is empty. |
| `isNonEmpty` | `const` | Test whether a `string` is non empty. |
| `isString` | `const` | Tests if a value is a `string`. |
| `kebabCase` | `const` | Converts a string to kebab-case (lowercase with hyphens). |
| `kebabToSnake` | `const` | Converts a kebab-case string to snake_case. |
| `lastIndexOf` | `const` | Returns the index of the last occurrence of a substring, or `None` if not found. |
| `length` | `const` | Calculate the number of characters in a `string`. |
| `linesIterator` | `const` | Returns an `IterableIterator` which yields each line contained within the string, trimming off the trailing newline character. |
| `linesWithSeparators` | `const` | Returns an `IterableIterator` which yields each line contained within the string as well as the trailing newline character. |
| `localeCompare` | `const` | Compares two strings according to the current locale. |
| `match` | `const` | A `pipe`-able version of the native `match` method. |
| `matchAll` | `const` | It is the `pipe`-able version of the native `matchAll` method. |
| `noCase` | `const` | Normalize a string to a specific case format |
| `normalize` | `const` | Normalizes a string according to the specified Unicode normalization form. |
| `Order` | `const` | `Order` instance for comparing strings using lexicographic ordering. |
| `padEnd` | `const` | Pads the string from the end with a given fill string to a specified length. |
| `padStart` | `const` | Pads the string from the start with a given fill string to a specified length. |
| `pascalCase` | `const` | Converts a string to PascalCase. |
| `pascalToSnake` | `const` | Converts a PascalCase string to snake_case. |
| `ReducerConcat` | `const` | A `Reducer` for concatenating `string`s. |
| `repeat` | `const` | Repeats the string the specified number of times. |
| `replace` | `const` | Replaces the first occurrence of a substring or pattern in a string. |
| `replaceAll` | `const` | Replaces all occurrences of a substring or pattern in a string. |
| `search` | `const` | Searches for a match between a regular expression and the string. |
| `slice` | `const` | Extracts a section of a string and returns it as a new string. |
| `snakeCase` | `const` | Converts a string to snake_case (lowercase with underscores). |
| `snakeToCamel` | `const` | Converts a snake_case string to camelCase. |
| `snakeToKebab` | `const` | Converts a snake_case string to kebab-case. |
| `snakeToPascal` | `const` | Converts a snake_case string to PascalCase. |
| `split` | `const` | Splits a string into an array of substrings using a separator. |
| `startsWith` | `const` | Returns `true` if the string starts with the specified search string. |
| `String` | `const` | Reference to the global `String` constructor. |
| `stripMargin` | `const` | For every line in this string, strip a leading prefix consisting of blanks or control characters followed by the `"\|"` character from the line. |
| `stripMarginWith` | `const` | For every line in this string, strip a leading prefix consisting of blanks or control characters followed by the character specified by `marginChar` from the line. |
| `substring` | `const` | Extracts characters from a string between two specified indices. |
| `takeLeft` | `const` | Keep the specified number of characters from the start of a string. |
| `takeRight` | `const` | Keep the specified number of characters from the end of a string. |
| `toLocaleLowerCase` | `const` | Converts the string to lowercase according to the specified locale. |
| `toLocaleUpperCase` | `const` | Converts the string to uppercase according to the specified locale. |
| `toLowerCase` | `const` | Converts a string to lowercase. |
| `toUpperCase` | `const` | Converts a string to uppercase. |
| `trim` | `const` | Removes whitespace from both ends of a string. |
| `Trim` | `type` | Type-level representation of trimming whitespace from both ends of a string. |
| `trimEnd` | `const` | Removes whitespace from the end of a string. |
| `TrimEnd` | `type` | Type-level representation of trimming whitespace from the end of a string. |
| `trimStart` | `const` | Removes whitespace from the start of a string. |
| `TrimStart` | `type` | Type-level representation of trimming whitespace from the start of a string. |
| `uncapitalize` | `const` | Uncapitalizes the first character of a string. |
