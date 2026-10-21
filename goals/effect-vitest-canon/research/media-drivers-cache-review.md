# Media driver runner dependency review

ExifTool and Face Detection now use `@beep/test-runner` in all seven existing
test files. Both packages declare it as a workspace development dependency.
The final cache census adds exactly one runner dependency to each of the
following 18 existing computation nodes:

- `@beep/exiftool#audit`
- `@beep/exiftool#build`
- `@beep/exiftool#check`
- `@beep/exiftool#coverage`
- `@beep/exiftool#lint:deprecated-apis`
- `@beep/exiftool#package-test-typecheck`
- `@beep/exiftool#test`
- `@beep/exiftool#test:integration`
- `@beep/exiftool#test:integration:parallel`
- `retired:face-detection#audit`
- `retired:face-detection#build`
- `retired:face-detection#check`
- `retired:face-detection#coverage`
- `retired:face-detection#lint:deprecated-apis`
- `retired:face-detection#package-test-typecheck`
- `retired:face-detection#test`
- `retired:face-detection#test:integration`
- `retired:face-detection#test:property`

Only those dependency arrays and this review reference change in the legacy
baseline. Existing dependency multiplicity is preserved, including repeated
utils transit edges. No command, configuration, source projection, scope or
qualification status changes. This records the dependency graph; it grants
no cache promotion or reuse permission.
