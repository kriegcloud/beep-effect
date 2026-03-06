# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-03

### Fixed
#### Python/Django Dead-Code Accuracy Fix

**🔍 Problem Identified**
A Django project (`testing`, 552 files) had:
- **crossFileCalls: 0** (should be 200+)
- **deadCodeCount: 753** (inflated with false positives)
- **6 concrete false positives** that were actually called

**🐛 Root Causes Found (5 bugs)**
1. **Python relative import specifiers lost**: `extractPythonImports` used `.slice(1)` but `relative_import` node type made it remove the first imported name.
2. **Python absolute imports never resolved**: `parser.ts` only handled `.` or tsconfig aliases. `from search.utils import X` fell through.
3. **Python caller `<module>` vs `__file__`**: Calls extractor used `<module>`, cross-file resolver expected `__file__`.
4. **No receiver extraction for method calls**: `obj.method()` stored as single string, not split into receiver+callee.
5. **No Python framework entry detection**: Dunders, `@property`, decorated views all flagged as dead.

**🛠️ Fixes Implemented**
- **extractPythonImports**: Fixed relative import specifier loss by checking node type. Preserved alias format `"original as alias"`, wildcard handling, explicit `isReExport: false`.
- **extractPythonCalls**: Split callerName into `__file__` and `calleeName` into `receiverName` and `calleeName`.
- **resolvePythonImportPath**: Added new function to `tsconfig-resolver.ts` to handle relative (`.models`, `..utils`) and absolute Python imports.
- **Framework Entry Detection**: Added dynamic generic decorator detection (e.g., `property`, `.route`, `register`, `task`) and parameter-based detection (`request`/`req`).
- **Dead-Code Query Improvements**: Excluded dunders, test functions, and registration decorators via generic Cypher patterns in `read-health.ts`, `read-rules.ts`, and `read-onboard.ts`.

**📊 Results on Django Project**
| Metric | Before | After | Change |
|---|---|---|---|
| **crossFileCalls** | 0 | **286** | ∞ |
| **totalCalls** | 262 | **715** | +173% |
| **dependsOn** | 0 | **304** | ∞ |
| **deadCodeCount** | 753 | **90** | **-88%** |
| **Tests** | 232 | **240** | +8 new |

**All 6 concrete FPs resolved:**
- `send_mail_for_async_function` → 6 callers
- `NEW_get_body_search_for_search_reviews` → 5 callers
- `NEW_execute_search_reviews_request` → 2 callers
- `get_products_keys_voysen_from_search_products` → 1 caller
- `NEW_get_unique_kpis_from_response` → 4 callers
- `NEW_get_n_brands_from_search_reviews_response` → 2 callers

**🧪 Test Coverage**
- **240/240 tests pass** (18 test files)
- **8 new regression tests** added.

**✅ Open-Source Ready**
- No hardcoded project patterns.
- Generic pattern-based detection.
- Dynamic framework recognition.
- Fully tested regression coverage.

## [1.0.0] - 2026-02-18
- Initial open-source release.
