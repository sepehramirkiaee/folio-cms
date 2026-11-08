"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { loginSchema, type LoginInput } from "../schemas/login";
import { loginAction } from "../server/actions";

type LoginFormProps = {
  /** Prefilled in demo mode so visitors can sign in with one click. */
  defaultValues?: Partial<LoginInput>;
};

export function LoginForm({ defaultValues }: LoginFormProps) {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", ...defaultValues },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await loginAction(values, searchParams.get("callbackUrl") ?? undefined);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    // method="post" keeps credentials out of the URL if a native submit ever happens.
    <form
      method="post"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={serverError ? "login-error" : undefined}
    >
      <FieldGroup>
        {serverError && (
          <Alert variant="destructive" id="login-error">
            <AlertCircle aria-hidden />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="email-error" errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="password-error" errors={[errors.password]} />
        </Field>

        <Button type="submit" disabled={!hydrated || pending} className="w-full">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
