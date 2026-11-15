import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EMAIL_PATTERN, ID_PATTERN, SLUG_PATTERN } from './src/lib/portfolioLogic';

const rulesSource = fs.readFileSync('./firestore.rules', 'utf8');

test('firestore.rules includes default-deny safety net and all blueprint collections', () => {
  assert.match(rulesSource, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
  const expectedCollections = [
    'siteSettings',
    'projects',
    'categories',
    'philosophy',
    'services',
    'stats',
    'testimonials',
    'media',
    'inquiries',
    'activities',
    'admins',
  ];
  for (const col of expectedCollections) {
    assert.ok(rulesSource.includes(`match /${col}/`), `Missing match block for ${col}`);
  }
});

test('firestore.rules enforces verified email for admin access and blocks unauthenticated inquiry reads', () => {
  assert.match(rulesSource, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesSource, /match \/inquiries\/\{inquiryId\}[\s\S]*allow get: if isAdmin\(\)/);
  assert.match(rulesSource, /match \/inquiries\/\{inquiryId\}[\s\S]*allow list: if isAdmin\(\)/);
  assert.match(rulesSource, /incoming\(\)\.status == 'unread'/);
});

test('firestore.rules enforces draft project isolation on both get and list', () => {
  assert.match(rulesSource, /allow get: if isValidId\(projectId\) && \(existing\(\)\.published == true \|\| isAdmin\(\)\)/);
  assert.match(rulesSource, /allow list: if resource\.data\.published == true \|\| isAdmin\(\)/);
});

test('Dirty Dozen adversarial payload checks match blueprint invariants', () => {
  // 1 & 2. Shadow field / pre-marked read status rejected by rules
  assert.match(rulesSource, /function isValidInquiry\(data\)[\s\S]*hasOnly\(\[/);
  // 4. Oversized message rejected
  assert.match(rulesSource, /isValidString\(data\.message, 10, 3000\)/);
  // 5. Invalid email format rejected
  assert.equal(EMAIL_PATTERN.test('not-an-email'), false);
  // 9. Path ID poisoning rejected
  assert.equal(ID_PATTERN.test('invalid$id!'), false);
  // Slug poisoning rejected
  assert.equal(SLUG_PATTERN.test('Valid-Slug'), false);
  assert.equal(SLUG_PATTERN.test('valid-slug-01'), true);
  // SiteSettings logoImageUrl field allowed with size limit in both schema helper and update keys
  assert.match(rulesSource, /isValidString\(data\.logoImageUrl, 0, 400000\)/);
});
