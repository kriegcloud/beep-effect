# JSDoc Analysis Report: @beep/mock

> **Generated**: 2025-12-06T05:34:45.375Z
> **Package**: packages/common/mock
> **Status**: 223 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ```typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/mock"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ```

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/_blog.ts:1` — **POST_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_blog.ts:6` — **POST_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_files.ts:46` — **FILE_TYPE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_files.ts:70` — **_folders** (const)
  - Missing: @category, @example, @since

- [ ] `src/_files.ts:84` — **_files** (const)
  - Missing: @category, @example, @since

- [ ] `src/_files.ts:97` — **_allFiles** (const)
  - Missing: @category, @example, @since

- [ ] `src/_invoice.ts:10` — **INVOICE_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_invoice.ts:17` — **INVOICE_SERVICE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_invoice.ts:37` — **_invoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:6` — **JOB_DETAILS_TABS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:11` — **JOB_SKILL_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:31` — **JOB_WORKING_SCHEDULE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:33` — **JOB_EMPLOYMENT_TYPE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:40` — **JOB_EXPERIENCE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:47` — **JOB_BENEFIT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:60` — **JOB_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:65` — **JOB_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_job.ts:107` — **_jobs** (const)
  - Missing: @category, @example, @since

- [ ] `src/_mock.ts:34` — **_mock** (const)
  - Missing: @category, @example, @since

- [ ] `src/_order.ts:6` — **ORDER_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_order.ts:22` — **_orders** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:7` — **_carouselsMembers** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:16` — **_faqs** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:25` — **_addressBooks** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:38` — **_contacts** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:88` — **_notifications** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:104` — **_mapContact** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:111` — **_socials** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:136` — **_pricingPlans** (const)
  - Missing: @category, @example, @since

- [ ] `src/_others.ts:170` — **_testimonials** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:8` — **_appRelated** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:21` — **_appInstalled** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:30` — **_appAuthors** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:37` — **_appInvoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:51` — **_appFeatured** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:61` — **_analyticTasks** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:66` — **_analyticPosts** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:74` — **_analyticOrderTimeline** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:91` — **_analyticTraffic** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:117` — **_ecommerceSalesOverview** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:123` — **_ecommerceBestSalesman** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:138` — **_ecommerceLatestProducts** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:154` — **_ecommerceNewProducts** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:163` — **_bankingContacts** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:170` — **_bankingCreditCard** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:197` — **_bankingRecentTransitions** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:258` — **_bookings** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:282` — **_bookingsOverview** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:288` — **_bookingReview** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:298` — **_bookingNew** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:313` — **_coursesContinue** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:321` — **_coursesFeatured** (const)
  - Missing: @category, @example, @since

- [ ] `src/_overview.ts:330` — **_coursesReminder** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:1` — **PRODUCT_GENDER_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:7` — **PRODUCT_CATEGORY_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:9` — **PRODUCT_RATING_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:11` — **PRODUCT_COLOR_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:22` — **PRODUCT_COLOR_NAME_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:33` — **PRODUCT_SIZE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:47` — **PRODUCT_STOCK_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:53` — **PRODUCT_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:58` — **PRODUCT_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_product.ts:65` — **PRODUCT_CATEGORY_GROUP_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_time.ts:6` — **_lastActivity** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:7` — **TOUR_DETAILS_TABS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:12` — **TOUR_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:18` — **TOUR_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:23` — **TOUR_SERVICE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:78` — **_tourGuides** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:85` — **TRAVEL_IMAGES** (const)
  - Missing: @category, @example, @since

- [ ] `src/_tour.ts:87` — **_tours** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:6` — **USER_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:13` — **_userAbout** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:32` — **_userFollowers** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:39` — **_userFriends** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:46` — **_userGallery** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:53` — **_userFeeds** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:87` — **_userCards** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:98` — **_userPayment** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:105` — **_userAddressBook** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:114` — **_userInvoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:121` — **_userPlans** (const)
  - Missing: @category, @example, @since

- [ ] `src/_user.ts:127` — **_userList** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:3` — **_id** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:7` — **_booleans** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:36` — **_prices** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:41` — **_ratings** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:46` — **_ages** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:50` — **_percents** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:55` — **_nativeS** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:57` — **_nativeM** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:62` — **_nativeL** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:67` — **_fullAddress** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:96` — **_emails** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:125` — **_fullNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:152` — **_firstNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:179` — **_lastNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:208` — **_phoneNumbers** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:253` — **_countryNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:298` — **_roles** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:327` — **_postTitles** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:356` — **_productNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:385` — **_tourNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:414` — **_jobTitles** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:443` — **_companyNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:472` — **_tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:501` — **_taskNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:530` — **_courseNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:559` — **_fileNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:586` — **_eventNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:615` — **_sentences** (const)
  - Missing: @category, @example, @since

- [ ] `src/assets.ts:644` — **_descriptions** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **POST_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:6` — **POST_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:46` — **FILE_TYPE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:70` — **_folders** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:84` — **_files** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:97` — **_allFiles** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:10` — **INVOICE_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:17` — **INVOICE_SERVICE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:37` — **_invoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:6` — **JOB_DETAILS_TABS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:11` — **JOB_SKILL_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:31` — **JOB_WORKING_SCHEDULE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:33` — **JOB_EMPLOYMENT_TYPE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:40` — **JOB_EXPERIENCE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:47` — **JOB_BENEFIT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:60` — **JOB_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:65` — **JOB_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:107` — **_jobs** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:34` — **_mock** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:6` — **ORDER_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:22` — **_orders** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **_carouselsMembers** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:16` — **_faqs** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:25` — **_addressBooks** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:38` — **_contacts** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:88` — **_notifications** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:104` — **_mapContact** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:111` — **_socials** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:136` — **_pricingPlans** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:170` — **_testimonials** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:8` — **_appRelated** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:21` — **_appInstalled** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:30` — **_appAuthors** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:37` — **_appInvoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:51` — **_appFeatured** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:61` — **_analyticTasks** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:66` — **_analyticPosts** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:74` — **_analyticOrderTimeline** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:91` — **_analyticTraffic** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:117` — **_ecommerceSalesOverview** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:123` — **_ecommerceBestSalesman** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:138` — **_ecommerceLatestProducts** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:154` — **_ecommerceNewProducts** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:163` — **_bankingContacts** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:170` — **_bankingCreditCard** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:197` — **_bankingRecentTransitions** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:258` — **_bookings** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:282` — **_bookingsOverview** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:288` — **_bookingReview** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:298` — **_bookingNew** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:313` — **_coursesContinue** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:321` — **_coursesFeatured** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:330` — **_coursesReminder** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **PRODUCT_GENDER_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **PRODUCT_CATEGORY_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:9` — **PRODUCT_RATING_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:11` — **PRODUCT_COLOR_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:22` — **PRODUCT_COLOR_NAME_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:33` — **PRODUCT_SIZE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:47` — **PRODUCT_STOCK_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:53` — **PRODUCT_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:58` — **PRODUCT_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:65` — **PRODUCT_CATEGORY_GROUP_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **TOUR_DETAILS_TABS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:12` — **TOUR_SORT_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:18` — **TOUR_PUBLISH_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:23` — **TOUR_SERVICE_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:78` — **_tourGuides** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:85` — **TRAVEL_IMAGES** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:87` — **_tours** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:6` — **USER_STATUS_OPTIONS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **_userAbout** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:32` — **_userFollowers** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:39` — **_userFriends** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:46` — **_userGallery** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:53` — **_userFeeds** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:87` — **_userCards** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:98` — **_userPayment** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:105` — **_userAddressBook** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:114` — **_userInvoices** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:121` — **_userPlans** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:127` — **_userList** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:3` — **_id** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **_booleans** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:36` — **_prices** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:41` — **_ratings** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:46` — **_ages** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:50` — **_percents** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:55` — **_nativeS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:57` — **_nativeM** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:62` — **_nativeL** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:67` — **_fullAddress** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:96` — **_emails** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:125` — **_fullNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:152` — **_firstNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:179` — **_lastNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:208` — **_phoneNumbers** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:253` — **_countryNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:298` — **_roles** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:327` — **_postTitles** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:356` — **_productNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:385` — **_tourNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:414` — **_jobTitles** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:443` — **_companyNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:472` — **_tags** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:501` — **_taskNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:530` — **_courseNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:559` — **_fileNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:586` — **_eventNames** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:615` — **_sentences** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:644` — **_descriptions** (const)
  - Missing: @category, @example, @since

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 223 |
| Fully Documented | 0 |
| Missing Documentation | 223 |
| Missing @category | 223 |
| Missing @example | 223 |
| Missing @since | 223 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/mock
```

If successful, delete this file. If issues remain, the checklist will be regenerated.