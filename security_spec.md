# Security Specification - ChequeVault BS

## 1. Data Invariants
- A cheque must belong to a valid user (`userId` match).
- Cheque status must be one of: `BOUNCE`, `CLEAR`, `POSTDATED`.
- Dates must be in BS format (string YYYY/MM/DD).
- Amounts must be positive numbers.
- Contact numbers should be strings.
- Users can only access their own data.

## 2. The "Dirty Dozen" Payloads (Targeting Rejection)

1. **Identity Spoofing**: Attempt to create a cheque for another `userId`.
2. **PII Leak**: Authenticated user trying to read `users/another_uid`.
3. **Invalid Status**: Setting cheque status to `UNKNOWN_STATUS`.
4. **Negative Amount**: Setting `amount` to -100.
5. **ID Poisoning**: Using a 2KB string as a `chequeId`.
6. **Self-Promotion**: Attempting to set an `isAdmin` field on a user profile.
7. **Shadow Update**: Adding a `internal_note` field to a cheque that isn't in the schema.
8. **Date Format Poisoning**: Sending a 1MB string into `chequeDateBS`.
9. **Orphaned Record**: Creating a cheque when the `users/{userId}` parent doesn't exist.
10. **State Skipping**: Updating `createdAt` on an existing cheque.
11. **Bulk List Scrape**: Querying all cheques without a `userId` filter.
12. **Unverified Write**: Writing to the database without a verified email (if strict enforcement is on).

## 3. Test Runner (Mock Logic)
A `firestore.rules.test.ts` will verify these rejections.
