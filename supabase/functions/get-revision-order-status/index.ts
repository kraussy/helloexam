import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  orderToken: z.string().uuid(),
  studentNumber: z.string().trim().min(2).max(60),
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

    const payload = requestSchema.parse(await req.json());
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("revision_orders")
      .select("id, student_name, status, created_at, personalized_pdf_path, amount_npr")
      .eq("order_token", payload.orderToken)
      .eq("student_number", payload.studentNumber)
      .maybeSingle();

    if (orderError) {
      throw new Error(orderError.message);
    }

    if (!order) {
      return Response.json(
        { error: "No order matched that token and student number." },
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: payment } = await supabaseAdmin
      .from("order_payments")
      .select("status")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return Response.json(
      {
        amountNpr: order.amount_npr,
        createdAt: order.created_at,
        downloadReady: order.status === "approved" || order.status === "completed",
        paymentStatus: payment?.status ?? "pending",
        personalizedPdfPath: order.personalized_pdf_path,
        status: order.status,
        studentName: order.student_name,
      },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return Response.json({ error: message }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
