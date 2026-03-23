import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  studentNumber: z.string().trim().min(2).max(60),
  contactPhone: z.string().trim().max(30).optional().transform((value) => value || null),
  transactionReference: z.string().trim().max(80).optional().transform((value) => value || null),
  paymentNote: z.string().trim().max(200).optional().transform((value) => value || null),
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
      .insert({
        student_name: payload.studentName,
        student_number: payload.studentNumber,
        contact_phone: payload.contactPhone,
      })
      .select("id, order_token, amount_npr, status")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Could not create the order.");
    }

    const { error: paymentError } = await supabaseAdmin.from("order_payments").insert({
      order_id: order.id,
      method: "manual",
      status: "submitted",
      transaction_reference: payload.transactionReference,
      payment_note: payload.paymentNote,
      amount_npr: order.amount_npr,
    });

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    return Response.json(
      {
        amountNpr: order.amount_npr,
        message: "Your order was saved. Complete manual payment, keep your token safe, and return here after approval.",
        orderId: order.id,
        orderToken: order.order_token,
        status: order.status,
      },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return Response.json({ error: message }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
