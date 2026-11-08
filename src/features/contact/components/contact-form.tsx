"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { emptyToNull, InputField, TextareaField } from "@/components/form/form-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { apiFetch } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { contactSchema, type ContactInput } from "../schemas/contact";

const empty: ContactInput = { name: "", email: "", subject: null, message: "", website: "" };

/**
 * Public contact form. It is a one-shot write with no cached server state to
 * keep in sync, so it posts with apiFetch directly instead of TanStack Query.
 */
export function ContactForm({ demoNotice }: { demoNotice?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string>();
  const sentRef = useRef<HTMLDivElement>(null);
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: empty,
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (status === "sent") sentRef.current?.focus();
  }, [status]);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("sending");
    setError(undefined);
    try {
      await apiFetch("/api/contact", { method: "POST", json: values });
      setStatus("sent");
      form.reset(empty);
    } catch (e) {
      setStatus("idle");
      if (!applyServerErrors(e, form.setError)) {
        setError(
          e instanceof Error ? e.message : "The message could not be sent. Please try again.",
        );
      }
    }
  });

  if (status === "sent") {
    return (
      <div ref={sentRef} tabIndex={-1} role="status" className="space-y-3 outline-none">
        <p className="flex items-center gap-2 text-lg font-medium">
          <CheckCircle2 className="size-5 text-brand" aria-hidden /> Message sent. Thank you.
        </p>
        <p className="text-muted-foreground">
          I read every message and usually reply within a few days.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <FieldGroup>
        {demoNotice && (
          <p className="text-sm text-muted-foreground">
            This is a public demo: anyone who signs in to the demo admin can read messages sent
            here. Please do not include personal details.
          </p>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <InputField
            id="contact-name"
            label="Name"
            autoComplete="name"
            error={errors.name}
            registration={form.register("name")}
          />
          <InputField
            id="contact-email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email}
            registration={form.register("email")}
          />
        </div>
        <InputField
          id="contact-subject"
          label="Subject (optional)"
          error={errors.subject}
          registration={form.register("subject", { setValueAs: emptyToNull })}
        />
        <TextareaField
          id="contact-message"
          label="Message"
          rows={6}
          error={errors.message}
          registration={form.register("message")}
        />
        {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>
        <div>
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" && <Loader2 className="animate-spin" aria-hidden />}
            Send message
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
