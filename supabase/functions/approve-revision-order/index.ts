import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  adminNote: z.string().trim().max(240).optional().transform((value) => value || null),
  orderId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server configuration is missing.");
    }

    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim();

    if (!jwt) {
      return Response.json(
        { error: "Missing authorization token." },
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = requestSchema.parse(await req.json());
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !userData.user) {
      return Response.json(
        { error: "Invalid session." },
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!role) {
      return Response.json(
        { error: "Admin access required." },
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const nextPaymentStatus = payload.status === "approved" ? "verified" : "failed";

    const { error: orderError } = await supabaseAdmin
      .from("revision_orders")
      .update({
        admin_note: payload.adminNote,
        approved_at: payload.status === "approved" ? new Date().toISOString() : null,
        status: payload.status,
      })
      .eq("id", payload.orderId);

    if (orderError) {
      throw new Error(orderError.message);
    }

    await supabaseAdmin
      .from("order_payments")
      .update({ status: nextPaymentStatus })
      .eq("order_id", payload.orderId);

    return Response.json(
      { message: `Order ${payload.status}.` },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return Response.json({ error: message }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
