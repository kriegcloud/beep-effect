# Import-style census

Enabling preferNamespaceImport at error reports 60530 per-project
occurrences at 3874 unique locations. Both new import-style
rules are off upstream by default. The existing namespaceImportPackages list is
an editor auto-import preference; deliberate named imports of @beep helper and
identity exports are pervasive. Enforcing it would require an independent repo
import migration. preferBarrelImport also contradicts the Effect module-path law.

The full location census remains in cache; no raw command logs enter this packet.
