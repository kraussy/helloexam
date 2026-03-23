import { useMemo, useState } from "react";
import { z } from "zod";
import { Loader2, Download, Copy, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const createOrderSchema = z.object({
  studentName: z.string().trim().min(2, "Enter your full name").max(120, "Name is too long"),
  studentNumber: z.string().trim().min(2, "Enter your student number").max(60, "Student number is too long"),
  contactPhone: z.string().trim().max(30, "Phone number is too long").optional(),
  transactionReference: z.string().trim().max(80, "Reference is too long").optional(),
  paymentNote: z.string().trim().max(200, "Note is too long").optional(),
});

const statusSchema = z.object({
  orderToken: z.string().uuid("Use the order token you received after payment"),
  studentNumber: z.string().trim().min(2, "Enter your student number").max(60, "Student number is too long"),
});

type OrderFormValues = z.infer<typeof createOrderSchema>;
type StatusFormValues = z.infer<typeof statusSchema>;

type OrderResponse = {
  amountNpr: number;
  message: string;
  orderId: string;
  orderToken: string;
  status: "pending" | "approved" | "rejected" | "completed";
};

type StatusResponse = {
  amountNpr: number;
  createdAt: string;
  downloadReady: boolean;
  paymentStatus: "pending" | "submitted" | "verified" | "failed";
  personalizedPdfPath: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  studentName: string;
};

const initialOrderForm: OrderFormValues = {
  studentName: "",
  studentNumber: "",
  contactPhone: "",
  transactionReference: "",
  paymentNote: "",
};

const initialStatusForm: StatusFormValues = {
  orderToken: "",
  studentNumber: "",
};

const functionsBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const statusBadgeClass: Record<StatusResponse["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-accent text-accent-foreground",
  completed: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export const RevisionOrderSection = () => {
  const [orderForm, setOrderForm] = useState<OrderFormValues>(initialOrderForm);
  const [statusForm, setStatusForm] = useState<StatusFormValues>(initialStatusForm);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [statusResult, setStatusResult] = useState<StatusResponse | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const steps = useMemo(
    () => [
      "Fill in your name and student number exactly as you want on the watermark.",
      "Collect the order token and complete manual payment using your QR or wallet number.",
      "After approval, come back here and download your personalized PDF instantly.",
    ],
    [],
  );

  const handleOrderChange = <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => {
    setOrderForm((current) => ({ ...current, [key]: value }));
  };

  const handleStatusChange = <K extends keyof StatusFormValues>(key: K, value: StatusFormValues[K]) => {
    setStatusForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderError(null);
    setOrderResult(null);

    const parsed = createOrderSchema.safeParse(orderForm);

    if (!parsed.success) {
      setOrderError(parsed.error.issues[0]?.message ?? "Please check your details and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke<OrderResponse>("create-revision-order", {
        body: parsed.data,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Could not create your order.");
      }

      setOrderResult(data);
      setStatusForm({ orderToken: data.orderToken, studentNumber: parsed.data.studentNumber });
      setStatusResult({
        amountNpr: data.amountNpr,
        createdAt: new Date().toISOString(),
        downloadReady: false,
        paymentStatus: "submitted",
        personalizedPdfPath: null,
        status: data.status,
        studentName: parsed.data.studentName,
      });
      setOrderForm(initialOrderForm);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Something went wrong while creating your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusError(null);

    const parsed = statusSchema.safeParse(statusForm);

    if (!parsed.success) {
      setStatusError(parsed.error.issues[0]?.message ?? "Please check your token and try again.");
      return;
    }

    setIsChecking(true);

    try {
      const { data, error } = await supabase.functions.invoke<StatusResponse>("get-revision-order-status", {
        body: parsed.data,
      });

      if (error || !data) {
        throw new Error(error?.message ?? "Could not fetch the order status.");
      }

      setStatusResult(data);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Something went wrong while checking the order.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyToken = async () => {
    if (!orderResult?.orderToken || !navigator.clipboard) return;
    await navigator.clipboard.writeText(orderResult.orderToken);
  };

  const handleDownload = async () => {
    const parsed = statusSchema.safeParse(statusForm);

    if (!parsed.success) {
      setStatusError(parsed.error.issues[0]?.message ?? "Please check your token and try again.");
      return;
    }

    setStatusError(null);
    setIsDownloading(true);

    try {
      const response = await fetch(`${functionsBaseUrl}/download-personalized-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: publishableKey,
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Download failed." }));
        throw new Error(payload.error ?? "Download failed.");
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `SEE-Revision-Kit-${parsed.data.studentNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "The PDF could not be downloaded.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="buy" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="eyebrow">Reserve your kit</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground">
            Manual payment mode
          </span>
        </div>

        <div className="mb-8 space-y-3">
          <h2 className="font-display text-3xl leading-[1.05] text-balance text-foreground md:text-4xl">
            Buy This Now and Get Surprise Question!
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Submit your order once, keep your order token safe, and download the personalized PDF after approval.
            Your file is stamped with your own details to discourage sharing.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmitOrder}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="studentName">
                Student name
              </label>
              <Input
                id="studentName"
                placeholder="Full name for watermark"
                value={orderForm.studentName}
                onChange={(event) => handleOrderChange("studentName", event.target.value)}
                className="h-12 rounded-2xl bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="studentNumber">
                Student number
              </label>
              <Input
                id="studentNumber"
                placeholder="SEE symbol / student number"
                value={orderForm.studentNumber}
                onChange={(event) => handleOrderChange("studentNumber", event.target.value)}
                className="h-12 rounded-2xl bg-card"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="contactPhone">
                Phone number (optional)
              </label>
              <Input
                id="contactPhone"
                placeholder="For payment confirmation"
                value={orderForm.contactPhone}
                onChange={(event) => handleOrderChange("contactPhone", event.target.value)}
                className="h-12 rounded-2xl bg-card"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="transactionReference">
                Payment reference (optional)
              </label>
              <Input
                id="transactionReference"
                placeholder="Last digits / receipt code"
                value={orderForm.transactionReference}
                onChange={(event) => handleOrderChange("transactionReference", event.target.value)}
                className="h-12 rounded-2xl bg-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="paymentNote">
              Payment note (optional)
            </label>
            <Textarea
              id="paymentNote"
              placeholder="Example: Sent from father’s eSewa account at 7:12 PM"
              value={orderForm.paymentNote}
              onChange={(event) => handleOrderChange("paymentNote", event.target.value)}
              className="min-h-[120px] rounded-[1.5rem] bg-card"
            />
          </div>

          <div className="rounded-[1.5rem] border border-border bg-secondary/60 p-4 text-sm leading-7 text-secondary-foreground">
            <p className="font-semibold">Placeholder payment block</p>
            <p>Replace this with your real QR, eSewa ID, Khalti number, or bank details before launch.</p>
            <p className="mt-2 font-medium">Current placeholder: QR / Wallet Number Here · Amount: Rs 49</p>
          </div>

          {orderError ? <p className="text-sm font-medium text-destructive">{orderError}</p> : null}

          <Button className="w-full" size="lg" type="submit" variant="hero" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Buy This Now and Get Surprise Question!
          </Button>

          <p className="text-xs leading-6 text-muted-foreground">
            Designed for final days before SEE. Watermark format: {{STUDENT_NAME}} · {{STUDENT_NUMBER}}
          </p>
        </form>

        {orderResult ? (
          <div className="mt-6 rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5 text-sm leading-7 text-foreground">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">Order saved successfully.</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                Pending approval
              </span>
            </div>
            <p>{orderResult.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-card px-4 py-2 font-mono text-sm tracking-[0.15em] text-foreground">
                {orderResult.orderToken}
              </div>
              <Button type="button" variant="soft" onClick={handleCopyToken}>
                <Copy />
                Copy token
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
          <div className="mb-5 flex items-center gap-3 text-foreground">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-display text-2xl leading-tight">How the delivery works</h3>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-[1.25rem] bg-secondary/50 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card text-sm font-bold text-foreground">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-dashed border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Watermarked PDF template</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Each generated file includes a visible watermark with <strong>{{STUDENT_NAME}}</strong> and <strong>{{STUDENT_NUMBER}}</strong>, then downloads directly from the site.
            </p>
          </div>
        </div>

        <div className="surface-panel rounded-[2rem] p-6 shadow-soft md:p-8">
          <div className="mb-5 space-y-2">
            <span className="eyebrow">Check your order</span>
            <h3 className="font-display text-2xl leading-tight text-foreground">Track approval and download</h3>
          </div>

          <form className="space-y-4" onSubmit={handleCheckStatus}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="orderToken">
                Order token
              </label>
              <Input
                id="orderToken"
                placeholder="Paste your token"
                value={statusForm.orderToken}
                onChange={(event) => handleStatusChange("orderToken", event.target.value)}
                className="h-12 rounded-2xl bg-card font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="statusStudentNumber">
                Student number
              </label>
              <Input
                id="statusStudentNumber"
                placeholder="Used for secure matching"
                value={statusForm.studentNumber}
                onChange={(event) => handleStatusChange("studentNumber", event.target.value)}
                className="h-12 rounded-2xl bg-card"
              />
            </div>

            {statusError ? <p className="text-sm font-medium text-destructive">{statusError}</p> : null}

            <Button className="w-full" type="submit" variant="soft" size="lg" disabled={isChecking}>
              {isChecking ? <Loader2 className="animate-spin" /> : null}
              Check status
            </Button>
          </form>

          {statusResult ? (
            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-border bg-secondary/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{statusResult.studentName}</p>
                <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", statusBadgeClass[statusResult.status])}>
                  {statusResult.status}
                </span>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                Payment status: <strong>{statusResult.paymentStatus}</strong> · Price: Rs {statusResult.amountNpr}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {statusResult.downloadReady
                  ? "Your personalized PDF is ready. Download it now."
                  : "Your order is still waiting for manual approval. Keep this page bookmarked and check again soon."}
              </p>

              {statusResult.downloadReady ? (
                <Button className="w-full" variant="hero" size="lg" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                  Download personalized PDF
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
