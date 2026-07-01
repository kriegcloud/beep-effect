---
"@beep/schema": patch
"@beep/law-practice-use-cases": patch
---

Make the Effect runtime schema generic over success, failure, and dependency
types so service contracts can preserve their concrete Effect shape.

Model the IR-to-law output and service shape as schema-backed classes, and
express the `toLaw` port through the shared function schema helper.
