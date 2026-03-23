import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { degrees, PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  orderToken: z.string().uuid(),
  studentNumber: z.string().trim().min(2).max(60),
});

const sanitizeFilePart = (value: string) => value.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const drawWatermark = (page: Awaited<ReturnType<PDFDocument["getPages"]>>[number], watermarkText: string) => {
  const { width, height } = page.getSize();

  for (let row = 0; row < 3; row += 1) {
    page.drawText(watermarkText, {
      x: 24,
      y: height * (0.25 + row * 0.22),
      size: 24,
      color: rgb(0.6, 0.57, 0.53),
      opacity: 0.15,
      rotate: degrees(32),
    });
  }

  page.drawText("Generated for personal revision use only", {
    x: 24,
    y: 18,
    size: 9,
    color: rgb(0.36, 0.31, 0.28),
    opacity: 0.6,
  });
};

const buildPlaceholderPdf = async (studentName: string, studentNumber: string) => {
  const pdfDoc = await PDFDocument.create();
  const headingFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const watermarkText = `${studentName} · ${studentNumber}`;

  const pages = [
    {
      title: "SEE Last-Minute Revision Kit",
      subtitle: "AI-reviewed from the pattern of the past 8 years",
      items: [
        "Most repeated question families sorted for fast revision",
        "Focus areas for Nepali, English, Maths, Science and Social",
        "Simple exam strategy notes for the final days before SEE",
      ],
    },
    {
      title: "How to use this in the final days",
      subtitle: "Study the highest-yield topics first",
      items: [
        "Start with repeated long-answer patterns",
        "Memorize the compact smart notes after each question block",
        "Review one surprise question before every exam morning",
      ],
    },
    {
      title: "Placeholder PDF uploaded",
      subtitle: "Replace with your final revision PDF any time",
      items: [
        "Upload your real source PDF to the private source bucket",
        "Keep the same file path if you want the current flow to keep working",
        "Watermarking will continue automatically on download",
      ],
    },
  ];

  pages.forEach((pageContent, pageIndex) => {
    const page = pdfDoc.addPage([595, 842]);
    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.98, 0.96, 0.92) });
    page.drawRectangle({ x: 32, y: 32, width: 531, height: 778, color: rgb(1, 1, 1), opacity: 0.92 });
    page.drawText(pageContent.title, { x: 56, y: 742, size: 22, font: headingFont, color: rgb(0.33, 0.18, 0.14) });
    page.drawText(pageContent.subtitle, { x: 56, y: 712, size: 11, font: bodyFont, color: rgb(0.48, 0.39, 0.34) });

    pageContent.items.forEach((item, itemIndex) => {
      const y = 645 - itemIndex * 96;
      page.drawRectangle({ x: 56, y: y - 14, width: 16, height: 16, color: rgb(0.88, 0.44, 0.24) });
      page.drawText(item, { x: 84, y, size: 13, font: bodyFont, color: rgb(0.18, 0.16, 0.15), maxWidth: 420, lineHeight: 18 });
    });

    page.drawText(`Page ${pageIndex + 1}`, { x: 500, y: 58, size: 10, font: bodyFont, color: rgb(0.48, 0.39, 0.34) });
    drawWatermark(page, watermarkText);
  });

  return pdfDoc.save();
};

const buildWatermarkedPdf = async (basePdfBytes: ArrayBuffer | null, studentName: string, studentNumber: string) => {
  const pdfDoc = basePdfBytes ? await PDFDocument.load(basePdfBytes) : await PDFDocument.load(await buildPlaceholderPdf(studentName, studentNumber));
  const pages = pdfDoc.getPages();
  const watermarkText = `${studentName} · ${studentNumber}`;

  pages.forEach((page) => drawWatermark(page, watermarkText));

  return pdfDoc.save();
};

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
      .select("id, student_name, student_number, status, personalized_pdf_path, source_pdf_path")
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

    if (!(order.status === "approved" || order.status === "completed")) {
      return Response.json(
        { error: "Your order has not been approved yet." },
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (order.personalized_pdf_path) {
      const { data: existingPdf, error: existingPdfError } = await supabaseAdmin.storage
        .from("revision-generated-pdfs")
        .download(order.personalized_pdf_path);

      if (!existingPdfError && existingPdf) {
        return new Response(await existingPdf.arrayBuffer(), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="SEE-Revision-Kit-${sanitizeFilePart(order.student_number)}.pdf"`,
          },
        });
      }
    }

    let sourcePdfBytes: ArrayBuffer | null = null;

    if (order.source_pdf_path) {
      const { data: sourcePdf } = await supabaseAdmin.storage.from("revision-source-pdfs").download(order.source_pdf_path);
      sourcePdfBytes = sourcePdf ? await sourcePdf.arrayBuffer() : null;
    }

    const personalizedPdf = await buildWatermarkedPdf(sourcePdfBytes, order.student_name, order.student_number);
    const generatedPath = `${order.id}/SEE-Revision-Kit-${sanitizeFilePart(order.student_number)}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage.from("revision-generated-pdfs").upload(generatedPath, personalizedPdf, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    await supabaseAdmin
      .from("revision_orders")
      .update({
        personalized_pdf_path: generatedPath,
        completed_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", order.id);

    return new Response(personalizedPdf, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SEE-Revision-Kit-${sanitizeFilePart(order.student_number)}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";

    return Response.json({ error: message }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
