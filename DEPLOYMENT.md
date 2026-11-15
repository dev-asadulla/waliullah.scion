# Voss & Kerr — Architectural Portfolio & Studio CMS Deployment Guide

## Architecture Overview
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons.
- **Database & Auth**: Firebase Firestore (`firebase-applet-config.json`) + Firebase Authentication (Google Sign-In).
- **Security**: Zero-trust Firestore Security Rules (`firestore.rules`) validated via `@firebase/eslint-plugin-security-rules`.

## Public & Admin Routes
- `/` — Public single-page architectural portfolio dynamically hydrated from Firestore.
- `/admin` — Protected Studio Content Management System (requires verified Google admin account).

## Database Setup & Security Rules
1. `firebase-applet-config.json` holds the provisioned Firebase project ID and Firestore database ID.
2. `firestore.rules` restricts all CMS mutations (`siteSettings`, `projects`, `categories`, `philosophy`, `services`, `stats`, `testimonials`, `media`, `activities`) to verified administrators while allowing public visitors to read published content and submit new contact inquiries (`inquiries`).
3. On first admin sign-in at `/admin`, the CMS automatically initializes Firestore collections if `siteSettings/studio` does not yet exist.

## Commands
- Development server: `npm run dev` (port 3000)
- Type check: `npm run lint`
- Rules lint: `npx eslint firestore.rules`
- Unit & security invariant tests: `npx --yes tsx --test src/lib/portfolioLogic.test.ts firestore.rules.test.ts`
- Production build: `npm run build`
