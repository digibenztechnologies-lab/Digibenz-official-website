# Contact inquiry email notifications

The static site stores inquiries through the existing `submit-website-enquiry` Edge Function. A Supabase Database Webhook can notify the separate `send-contact-email` Edge Function after each successful insert. This keeps email-provider delays or failures from preventing the database insert.

## Existing data contract

The live table is `public.website_enquiries`. It stores `id`, `full_name`, optional `business_name`, `mobile_number`, `email_address`, optional `message`, `industry`, selected services, monthly budget, website URL, consent timestamps, `submitted_at`, and an internal status. Row Level Security remains enabled and the table has no public policies. The four optional fields were added through an additive migration; existing records are preserved.

The existing form handler sends all of those optional details to Supabase, and the updated submission function persists them. Notification emails include the actual stored form fields, submission time, and inquiry ID.

## One-time Resend setup

1. Create or sign in to a Resend account at [resend.com](https://resend.com/).
2. Add `digibenz.com` in Resend and complete the DNS verification records Resend provides. Use a sender address on that verified domain, for example `website@digibenz.com`.
3. Create a Resend API key with permission to send email.
4. In the Supabase dashboard, open project `isezeiucecnxteiiqdzd` → **Edge Functions** → **Secrets** and add:

   | Name | Value |
   | --- | --- |
   | `RESEND_API_KEY` | The Resend API key; keep it private |
   | `CONTACT_TO_EMAIL` | `digibenztechnologies@gmail.com` |
   | `CONTACT_FROM_EMAIL` | A sender on the verified domain, such as `Digibenz Technologies <website@digibenz.com>` |

   These must remain server-side Supabase secrets. Do not put them in website JavaScript, Vercel client variables, or GitHub.

## Deploy and connect the function

The function source is `supabase/functions/send-contact-email/index.ts`. Deploy it to project `isezeiucecnxteiiqdzd` with JWT verification disabled at the platform layer; the handler authenticates the request using Supabase's `auth: "secret"` service-to-service check. The Supabase Dashboard deployment UI or the Supabase CLI can deploy it.

Then, in Supabase **Database → Webhooks**, create one webhook:

- Name: `digibenz-contact-email`
- Table: `public.website_enquiries`
- Event: `INSERT` only
- Webhook type: **Supabase Edge Functions**
- Function: `send-contact-email`
- HTTP header: add the project's Supabase **secret key** using the dashboard's **Add secret key** option

The current Supabase dashboard webhook flow attaches the project secret in the `apikey` header. The function validates that key and rejects anonymous calls; do not make it an unauthenticated email endpoint. Avoid defining the same webhook twice.

## Verify the complete flow

After setting the secrets and webhook, submit one clearly labelled internal test inquiry using a test address you control. Confirm the row is inserted into `public.website_enquiries`, inspect Supabase webhook/function logs, and check the destination inbox and spam folder. Reply to the notification and confirm Gmail addresses the reply to the visitor's email. Do not use real customer details for tests.

The Resend request uses the inquiry UUID as an idempotency key to suppress duplicate sends if the same webhook event is retried within Resend's 24-hour idempotency window. Supabase's `pg_net` webhook is asynchronous; inspect webhook logs for failed calls and retry only after correcting the cause. A 2xx response means Resend accepted the send request, not that Gmail delivered it; verify delivery in Resend and the inbox.

## Change the recipient later

Update `CONTACT_TO_EMAIL` in Supabase Edge Function secrets and redeploy/restart the function if prompted. No website code or Vercel deployment is needed for recipient or sender-secret changes.

## Troubleshooting

- **No notification:** check that the Supabase project is active, the single INSERT webhook is enabled, and the function logs show a request.
- **401 response:** edit the webhook and re-add the project's secret key; keep `verify_jwt = false` for this webhook function because the handler performs the service-key check itself.
- **503 configuration response:** verify all three Supabase secrets are set and that the recipient is a valid email address.
- **Resend 401/403:** rotate the Resend API key and update `RESEND_API_KEY`; ensure the sender domain is verified.
- **Resend 429/5xx:** inspect Resend status and webhook logs, then retry the failed webhook after the provider recovers. The inquiry remains saved even if email delivery fails.

## Costs and service dependencies

The site and database remain on the existing plan. Resend has its own account and sending limits, and its current free-tier allowance may change. Check the Resend dashboard for current limits before relying on production volume. No Gmail password or SMTP credential is used.
