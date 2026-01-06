# Schema Annotations Audit: @beep/ui-core

## Summary
- Total Schemas Found: 7
- Annotated: 5
- Missing Annotations: 2

## Annotationless Schemas Checklist

- [ ] `src/i18n/constants.ts:14` - `LangValueToAdapterLocale` - S.transformLiterals
- [ ] `src/i18n/SupportedLangValue.ts:3` - `SupportedLangValue` - StringLiteralKit

## Annotated Schemas (Reference)

The following schemas are properly annotated:

| File | Line | Schema | Type |
|------|------|--------|------|
| `src/adapters/schema.ts` | 17 | `DateInputToDateTime` | S.Union |
| `src/i18n/languages.ts` | 4 | `SupportedLocale` | BS.StringLiteralKit |
| `src/utils/swipeUtils.ts` | 5 | `HorizontalDirection` | BS.StringLiteralKit |
| `src/utils/swipeUtils.ts` | 17 | `VerticalDirection` | BS.StringLiteralKit |
| `src/utils/swipeUtils.ts` | 29 | `SwipeDirection` | BS.StringLiteralKit |
