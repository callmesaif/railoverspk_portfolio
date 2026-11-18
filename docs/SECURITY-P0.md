# P0 Security and Authentication

## Administrator authorization

Admin access is controlled by a Firebase Authentication custom claim:

`admin: true`

A valid Firebase sign-in is not enough. Server API handlers use `verifyAdmin()`, which verifies the Firebase ID token, checks token revocation, and requires the admin claim. The admin UI also checks the claim for navigation and presentation; API authorization remains the security boundary.

### Grant the first administrator

1. Create or identify the intended administrator account in Firebase Authentication.
2. Obtain that account's Firebase Auth UID from the Firebase Console.
3. Run the claim-management script from a trusted workstation or secure CI environment with the Firebase Admin service-account environment variables configured:

```bash
node scripts/set-admin-claim.mjs <FIREBASE_AUTH_UID> grant
```

The script supports either `FIREBASE_SERVICE_ACCOUNT` (JSON service-account object) or the three variables `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`. Never commit service-account credentials or expose them through `NEXT_PUBLIC_*` variables.

To revoke the admin role:

```bash
node scripts/set-admin-claim.mjs <FIREBASE_AUTH_UID> revoke
```

After granting a claim, the user should sign out and sign in again, or force-refresh their Firebase ID token. Revocation also revokes refresh tokens.

## Required deployment configuration

Configure this server-only environment variable in Vercel for the environments that receive Vercel webhooks:

- `VERCEL_WEBHOOK_SECRET`: the secret generated when creating the Vercel webhook. Do not use the Vercel API bearer token for this value.

The deployment status endpoint also requires:

- `VERCEL_BEARER_TOKEN`
- `VERCEL_PROJECT_ID`

The deployments endpoint is now admin-only and returns a deliberately reduced response.

## Firebase Firestore and Storage rules — outstanding verification

The repository did not contain `firestore.rules`, `storage.rules`, or `firebase.json` at the root when audited. The admin dashboard currently uses the Firebase client SDK for Firestore subscriptions and mutations. Firebase Security Rules must independently restrict writes to users whose authenticated token has `admin == true`, and must not rely on the visibility of the admin UI.

Before deploying, export or provide the currently deployed Firestore and Storage rules and verify that:
- Public reads are limited to the collections/documents intended to be public.
- Writes to trains, locomotives, posts, reviews, reports, analytics, comments, deployments, and contact messages are denied unless the caller has the admin claim (with any explicitly intended public submission flow handled separately).
- Storage uploads, updates, and deletes are restricted to admins and enforce content type and size limits.
- Rules do not grant broad access through an overlapping wildcard match.

Do not deploy permissive placeholder rules. The actual collection model and public read requirements must be reviewed before authoring replacement rules.

## Remaining P0/P1 follow-up

- Move rate limiting from the in-memory Map to a shared store (e.g. Redis/Upstash) for reliable enforcement across serverless instances.
- Add request-size limits and stricter schema validation to write endpoints.
- Review the public contact form for abuse controls and data retention.
- Test API authorization with no token, an ordinary authenticated user, an admin user, and a revoked token.
- Validate Vercel webhook delivery from the actual configured webhook after setting `VERCEL_WEBHOOK_SECRET`.
- Audit Firebase rules and test direct client SDK access separately from API route tests.

## Verification status

These changes are a source-level hardening pass. They have not been runtime-tested against the live Firebase project or deployed environment. Complete the verification checklist and CI build before merging or deploying.
