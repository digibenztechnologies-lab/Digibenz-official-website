import { withSupabase } from "npm:@supabase/server@1";

type EnquiryRecord = {
  id: string;
  full_name: string;
  business_name: string | null;
  mobile_number: string;
  email_address: string;
  industry: string | null;
  services_required: string[];
  monthly_budget: string | null;
  website_url: string | null;
  message: string | null;
  submitted_at: string;
};

type DatabaseWebhook = {
  type: string;
  schema: string;
  table: string;
  record: EnquiryRecord | null;
  old_record: unknown;
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function cleanText(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").trim();
}

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function validateEvent(payload: unknown): EnquiryRecord | null {
  if (!isRecord(payload)) return null;
  const event = payload as unknown as DatabaseWebhook;
  if (
    event.type !== "INSERT" || event.schema !== "public" ||
    event.table !== "website_enquiries" || event.old_record !== null ||
    !isRecord(event.record)
  ) return null;

  const record = event.record;
  if (
    typeof record.id !== "string" || !uuidPattern.test(record.id) ||
    typeof record.full_name !== "string" || record.full_name.trim().length < 2 ||
    record.full_name.length > 120 ||
    typeof record.mobile_number !== "string" || record.mobile_number.length > 24 ||
    typeof record.email_address !== "string" || record.email_address.length > 254 ||
    !emailPattern.test(record.email_address) ||
    (record.business_name !== null && typeof record.business_name !== "string") ||
    (record.industry !== null && typeof record.industry !== "string") ||
    !Array.isArray(record.services_required) ||
    !record.services_required.every((service) => typeof service === "string" && service.length <= 120) ||
    record.services_required.length > 20 ||
    (record.monthly_budget !== null && typeof record.monthly_budget !== "string") ||
    (record.website_url !== null && typeof record.website_url !== "string") ||
    (record.message !== null && typeof record.message !== "string") ||
    typeof record.submitted_at !== "string" ||
    (record.business_name?.length ?? 0) > 180 ||
    (record.industry?.length ?? 0) > 120 ||
    (record.monthly_budget?.length ?? 0) > 120 ||
    (record.website_url?.length ?? 0) > 2048 ||
    (record.message?.length ?? 0) > 5000
  ) return null;

  return record as EnquiryRecord;
}

function buildHtml(record: EnquiryRecord): string {
  const name = escapeHtml(record.full_name);
  const business = record.business_name?.trim()
    ? escapeHtml(record.business_name.trim())
    : "Not provided";
  const industry = record.industry?.trim() ? escapeHtml(record.industry.trim()) : "Not provided";
  const services = record.services_required.length
    ? escapeHtml(record.services_required.join(", "))
    : "Not provided";
  const budget = record.monthly_budget?.trim()
    ? escapeHtml(record.monthly_budget.trim())
    : "Not provided";
  const website = record.website_url?.trim()
    ? escapeHtml(record.website_url.trim())
    : "Not provided";
  const message = record.message?.trim()
    ? escapeHtml(record.message.trim())
    : "No message provided.";
  const submittedAt = escapeHtml(formatSubmittedAt(record.submitted_at));
  const rows = [
    ["Name", name],
    ["Email address", escapeHtml(record.email_address)],
    ["Phone number", escapeHtml(record.mobile_number)],
    ["Business name", business],
    ["Industry", industry],
    ["Services requested", services],
    ["Monthly budget", budget],
    ["Website", website],
    ["Submitted", submittedAt],
    ["Inquiry ID", escapeHtml(record.id)],
  ].map(([label, value]) =>
    `<tr><th align="left" style="padding:10px 12px;color:#52627a;font-size:13px;border-bottom:1px solid #e6ebf2;white-space:nowrap">${label}</th><td style="padding:10px 12px;color:#172b4d;font-size:14px;border-bottom:1px solid #e6ebf2;word-break:break-word">${value}</td></tr>`
  ).join("");

  return `<!doctype html><html><body style="margin:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172b4d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e4eaf3;border-radius:16px;overflow:hidden"><tr><td style="padding:24px 28px;background:linear-gradient(110deg,#0b4fae,#176fe0);color:#fff"><div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:.85">Digibenz Technologies</div><h1 style="margin:8px 0 0;font-size:23px;line-height:1.3">New website inquiry</h1></td></tr><tr><td style="padding:24px 28px"><p style="margin:0 0 18px;font-size:15px;line-height:1.6">A new contact form inquiry has been saved in Supabase.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table><h2 style="margin:24px 0 8px;font-size:16px;color:#172b4d">Message</h2><div style="padding:16px;background:#f5f8fc;border-left:3px solid #176fe0;border-radius:8px;font-size:14px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere">${message}</div><p style="margin:22px 0 0;font-size:12px;color:#6d7c91">This notification was sent automatically from the Digibenz website. Reply to this email to respond directly to the visitor.</p></td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(withSupabase({ auth: "secret" }, async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const recipient = Deno.env.get("CONTACT_TO_EMAIL")?.trim();
  const sender = Deno.env.get("CONTACT_FROM_EMAIL")?.trim();
  if (!apiKey || !recipient || !sender || !emailPattern.test(recipient)) {
    console.error("Contact email configuration is incomplete.");
    return json({ error: "Email notification configuration is incomplete." }, 503);
  }

  let payload: unknown;
  try {
    const rawBody = await req.text();
    if (rawBody.length > 32_000) return json({ error: "Webhook payload is too large." }, 413);
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  const record = validateEvent(payload);
  if (!record) return json({ error: "Invalid or unsupported enquiry INSERT event." }, 400);

  const visitorEmail = record.email_address.trim();
  const visitorName = cleanText(record.full_name);
  const subjectName = visitorName.slice(0, 120);
  const message = record.message?.trim() ?? "";
  const text = [
    "New DigiBenz website inquiry",
    `Name: ${visitorName}`,
    `Email address: ${visitorEmail}`,
    `Phone number: ${record.mobile_number}`,
    `Business name: ${record.business_name?.trim() || "Not provided"}`,
    `Industry: ${record.industry?.trim() || "Not provided"}`,
    `Services requested: ${record.services_required.join(", ") || "Not provided"}`,
    `Monthly budget: ${record.monthly_budget?.trim() || "Not provided"}`,
    `Website: ${record.website_url?.trim() || "Not provided"}`,
    `Submitted: ${formatSubmittedAt(record.submitted_at)}`,
    `Inquiry ID: ${record.id}`,
    "",
    "Message:",
    message || "No message provided.",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `website-enquiry/${record.id}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: visitorEmail,
        subject: `New DigiBenz Inquiry – ${subjectName}`,
        html: buildHtml(record),
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Resend rejected an enquiry notification", { status: response.status });
      return json({ error: "Email provider rejected the notification." }, response.status === 429 ? 503 : 502);
    }

    const result = await response.json().catch(() => ({}));
    console.info("Contact inquiry notification accepted", { inquiryId: record.id });
    return json({ ok: true, emailId: isRecord(result) ? result.id : undefined });
  } catch (error) {
    console.error("Contact inquiry notification could not reach the email provider", {
      inquiryId: record.id,
      reason: error instanceof Error ? error.name : "UnknownError",
    });
    return json({ error: "Email provider is temporarily unavailable." }, 503);
  }
}));
