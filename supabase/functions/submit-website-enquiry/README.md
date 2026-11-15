Deployed Edge Function: `submit-website-enquiry`. Project ref: `isezeiucecnxteiiqdzd`.

Source is maintained in `index.ts`. It validates the existing website form payload and saves its contact details plus optional industry, selected services, monthly budget, and website URL in `public.website_enquiries`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side. The function is configured with `verify_jwt = false` because it is called by the public website; it uses an origin allowlist, input validation, and a honeypot field.
