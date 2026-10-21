# Cache policy review for the main merge

The branch retains two Graft module environment names in the root Turbo
configuration. The baseline from main predates those inputs. Re-record the
root configuration fingerprint without changing its qualification.

The contacts app has a generated build override with empty outputs for its
no-emit build. The CLI manifest adds its scripts tsconfig to beep:check.
The manifest bytes are an input to every CLI task listed below.
These are the only drifted subjects. Keep the existing scope, profile, epoch,
cache flags, and qualification unchanged.

Reviewed tasks:

- `@beep/practice-m365-contacts#build`
- `@beep/repo-cli#build`
- `@beep/repo-cli#check`
- `@beep/repo-cli#docgen`
- `@beep/repo-cli#doctest`
- `@beep/repo-cli#lint`
- `@beep/repo-cli#lint:deprecated-apis`
- `@beep/repo-cli#lint:jsdoc`
- `@beep/repo-cli#lint:laws`
- `@beep/repo-cli#test`
- `@beep/repo-cli#test:property`
