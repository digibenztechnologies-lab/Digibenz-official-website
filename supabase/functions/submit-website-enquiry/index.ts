const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const allowedOrigins = new Set([
  "https://digibenz.com",
  "https://www.digibenz.com",
  "http://localhost:8765",
  "http://127.0.0.1:8765",
  "null",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+0-9() .-]{8,24}$/;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    return allowedOrigins.has(origin)
      ? new Response("ok", { headers: cors(origin) })
      : new Response(null, { status: 403 });
  }
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  if (!allowedOrigins.has(origin)) return Response.json({ error: "Origin not allowed" }, { status: 403 });

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid enquiry." }, { status: 400, headers: cors(origin) });
    }
    if (typeof body.company_fax === "string" && body.company_fax.trim()) {
      return Response.json({ ok: true }, { headers: cors(origin) });
    }

    const full_name = String(body.full_name ?? "").trim();
    const mobile_number = String(body.mobile_number ?? "").trim();
    const email_address = String(body.email_address ?? "").trim();
    const businessValue = String(body.business_name ?? "").trim();
    const messageValue = String(body.message ?? "").trim();
    const industryValue = String(body.industry ?? "").trim();
    const budgetValue = String(body.monthly_budget ?? "").trim();
    const websiteValue = String(body.website_url ?? "").trim();
    const rawServices = body.services_required ?? [];

    if (
      full_name.length < 2 || full_name.length > 120 ||
      !phonePattern.test(mobile_number) || email_address.length > 254 ||
      !emailPattern.test(email_address) || businessValue.length > 180 ||
      messageValue.length > 5000 || industryValue.length > 120 ||
      budgetValue.length > 120 || websiteValue.length > 2048 ||
      !Array.isArray(rawServices) || rawServices.length > 20 ||
      !rawServices.every((service: unknown) => typeof service === "string" && service.trim().length <= 120)
    ) {
      return Response.json(
        { error: "Please check your name, mobile number, email address and enquiry details." },
        { status: 400, headers: cors(origin) },
      );
    }

    const services_required = rawServices.map((service: string) => service.trim()).filter(Boolean);
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Server configuration is incomplete.");

    const response = await fetch(`${url}/rest/v1/website_enquiries`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        full_name,
        business_name: businessValue || null,
        mobile_number,
        email_address,
        message: messageValue || null,
        industry: industryValue || null,
        services_required,
        monthly_budget: budgetValue || null,
        website_url: websiteValue || null,
        consent: true,
      }),
    });

    if (!response.ok) {
      console.error("Enquiry insert failed", { status: response.status });
      return Response.json(
        { error: "We could not save your enquiry. Please try again or contact us directly." },
        { status: 502, headers: cors(origin) },
      );
    }
    return Response.json({ ok: true }, { status: 201, headers: cors(origin) });
  } catch (error) {
    console.error("Enquiry handler failed", { reason: error instanceof Error ? error.name : "UnknownError" });
    return Response.json(
      { error: "We could not process your enquiry. Please try again." },
      { status: 500, headers: cors(origin) },
    );
  }
});
