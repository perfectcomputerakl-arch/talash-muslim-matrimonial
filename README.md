# TALASH — Muslim Matrimonial App (Starter Project)

This is a starter codebase for an Android-first matrimonial app with a web admin panel.

## Product decisions included
- Muslim-only platform using a **self-declaration** during registration. Do not ask users to upload religious documents.
- Live camera capture for profile photo and a separate selfie-verification capture.
- Admin reviews submitted profiles and marks them Verified / Rejected.
- No automated face recognition or claim of biometric/liveness verification is included.
- Users control profile visibility and can request account deletion.
- Contact details are not public by default.

## Stack
- Mobile: Expo + React Native + TypeScript
- Backend: Supabase (Auth, Postgres, Storage, Row Level Security)
- Admin: lightweight React + Vite dashboard
- Database setup: `supabase/schema.sql`

## Important
This is a functional project scaffold, not a production-certified matrimonial service. Before public launch:
1. Create a Supabase project and configure Auth + Storage.
2. Apply `supabase/schema.sql`.
3. Add your Supabase URL and anon key to mobile and admin `.env` files.
4. Configure an admin account and set its role to `admin` in `profiles`.
5. Test permissions, moderation, account deletion, backups, and privacy notices.
6. Have local legal/privacy terms reviewed for the countries where you launch.
7. Use a trusted SMS OTP provider if phone OTP is required; SMS may incur charges.

## Run mobile app
```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```
Use Expo Go for early UI testing. For camera permissions and production builds, create an EAS development/production build.

## Run admin panel
```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

## Verification flow
1. User signs up and accepts the Muslim-only community declaration.
2. User captures a profile photo using the device camera.
3. User captures a separate live selfie for review.
4. User submits profile for review.
5. Admin checks the submitted information and selfie, then approves or rejects.
6. Only approved profiles receive the `verified` status.

Never expose verification selfie storage publicly. Delete verification selfies after the review period unless there is a documented, consented reason to retain them.
