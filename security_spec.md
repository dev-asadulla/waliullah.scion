# Firestore Security Specification & Red-Team Audit

## 1. Data Invariants
1. **CMS Ownership**: Only verified administrators (`isAdmin()`, bootstrapped with `ag.developer.co@gmail.com` or UIDs registered in `/admins/{uid}`) may create, update, or delete portfolio content (`siteSettings`, `projects`, `categories`, `philosophy`, `services`, `stats`, `testimonials`, `media`, `activities`, `admins`).
2. **Draft Isolation**: Unpublished projects (`published == false`) are strictly hidden from unauthenticated and non-admin readers on both `get` and `list`.
3. **Inquiry PII Isolation**: Public visitors may only `create` an inquiry with `status == 'unread'` and server timestamp `createdAt == request.time`. Reading, listing, updating (`status` toggle), or deleting inquiries is strictly restricted to verified admins.
4. **Immutable Creation Timestamps**: Any entity with `createdAt` must match `request.time` on creation and preserve `incoming().createdAt == existing().createdAt` on update.
5. **Strict Key Allowlists & Size Bounds**: Every collection enforces `keys().hasAll(...)` and `keys().hasOnly(...)` on creation, `affectedKeys().hasOnly(...)` on updates, and explicit `.size()` bounds on every string and array.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Inquiry**: `{ name, email, projectType, message, status: 'unread', createdAt, isVerified: true }` -> Rejected (`hasOnly` blocks `isVerified`).
2. **Pre-Marked Read Inquiry**: `{ name, email, projectType, message, status: 'read', createdAt }` -> Rejected (`status == 'unread'` required on create).
3. **Forged Inquiry Timestamp**: `{ ..., createdAt: "2020-01-01T00:00:00Z" }` -> Rejected (`createdAt == request.time`).
4. **Oversized Message Poisoning**: `{ ..., message: "<5000 chars>" }` -> Rejected (`message.size() <= 3000`).
5. **Invalid Inquiry Email Format**: `{ ..., email: "not-an-email" }` -> Rejected (regex check).
6. **Unauthenticated Draft Project Read/List**: `list /projects` without `where('published', '==', true)` -> Rejected (`resource.data.published == true || isAdmin()`).
7. **Unverified Admin Email Spoof**: Signed-in token with `email == 'ag.developer.co@gmail.com'` and `email_verified == false` -> Rejected (`email_verified == true` required).
8. **Self-Assigned Admin Escalation**: Non-admin writing to `/admins/{uid}` -> Rejected (`isAdmin()` required).
9. **Path ID Poisoning**: Creating `/projects/invalid$id!` or 500-char ID -> Rejected (`isValidId()` regex and length <= 128).
10. **Project Shadow Update**: Admin or attacker updating `projects` with unknown key `viewsCount: 999` -> Rejected (`affectedKeys().hasOnly(...)` + `isValidProject`).
11. **Project CreatedAt Tampering**: Updating `projects` with modified `createdAt` -> Rejected (`incoming().createdAt == existing().createdAt`).
12. **PII Inquiry Scrape**: Unauthenticated or non-admin `get` or `list` on `/inquiries` -> Rejected (`isAdmin()` required).
