<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the React Native Expo app. Here is a summary of every change made:

- **`app.config.js`** (new) — Converted from `app.json` to `app.config.js` so that `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` environment variables are injected as Expo constants extras at build time.
- **`.env`** — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` keys.
- **`lib/posthog.ts`** (new) — Singleton PostHog client instantiated from `expo-constants` extras. Disabled automatically when the token is absent, with debug logging in dev.
- **`app/_layout.tsx`** — Wrapped the app in `PostHogProvider` (with `captureTouches` autocapture); added manual screen tracking via `posthog.screen()` using `usePathname` + `useGlobalSearchParams`.
- **`app/(auth)/sign-in.tsx`** — Added `user_signed_in`, `user_sign_in_failed`, and `user_mfa_code_sent` events. Added `posthog.identify()` on successful sign-in to correlate future events to the authenticated user.
- **`app/(auth)/sign-up.tsx`** — Added `user_sign_up_submitted` and `user_signed_up` events. Added `posthog.identify()` with `$set_once` on registration completion.
- **`app/(tabs)/settings.tsx`** — Added `user_signed_out` event and `posthog.reset()` to clear the identified user on sign-out.
- **`app/(tabs)/index.tsx`** — Added `subscription_card_expanded` event when a user expands a subscription card, with subscription name and billing as properties.
- **`app/subscriptions/[id].tsx`** — Added `subscription_details_viewed` event on mount.

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully completed sign-in (password or MFA) | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt failed due to invalid credentials or error | `app/(auth)/sign-in.tsx` |
| `user_mfa_code_sent` | MFA email verification code was sent during sign-in | `app/(auth)/sign-in.tsx` |
| `user_sign_up_submitted` | User submitted the sign-up form with email and password | `app/(auth)/sign-up.tsx` |
| `user_signed_up` | User completed registration after verifying their email | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User confirmed sign-out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User tapped a subscription card to expand its details | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User navigated to the subscription details screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/406192/dashboard/1535328
- **Sign-up conversion funnel**: https://us.posthog.com/project/406192/insights/XZcuyShq
- **Daily sign-ins**: https://us.posthog.com/project/406192/insights/sdjgLYLZ
- **Sign-in failures**: https://us.posthog.com/project/406192/insights/KLHiCb1u
- **User churn — sign-outs per day**: https://us.posthog.com/project/406192/insights/pwCdq44W
- **Subscription card engagement**: https://us.posthog.com/project/406192/insights/jMf6TrLy

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
